namespace eflib.ui {
    /** ShowAll参数 */
    export type ShowAllScreenParam = {
        /** 最小宽度 */
        minWidth?: number,
        /** 最大宽度 */
        maxWidth?: number,
        /** 最小高度 */
        minHeight?: number,
        /** 最大高度 */
        maxHeight?: number,
        /** 顶部安全距离 */
        screenTopSafe?: number,
        /** 底部安全距离 */
        screenBottomSafe?: number,
    }
    /** ShowAll根节点 */
    export class ShowAllRootView extends eui.Group implements egret.sys.IScreenAdapter {
        private static _ins: ShowAllRootView;
        public static getInstance<T extends ShowAllRootView>(this: Class<T>) {
            //由于白鹭的编译器处理继承时对static变量处理有问题，这里不能用this获取
            return ShowAllRootView._ins as T;
        }

        private upMask = new eui.Rect();
        private downMask = new eui.Rect();
        private leftMask = new eui.Rect();
        private rightMask = new eui.Rect();

        private screenParam: ShowAllScreenParam;
        private _stageTopSafe = 0;
        public get stageTopSafe() {
            return this._stageTopSafe;
        }
        private _stageBottomSafe = 0;
        public get stageBottomSafe() {
            return this._stageBottomSafe;
        }
        /**
         * 设置宽高参数
         * @param screenParam 参数
         */
        public setScreenParam(screenParam: ShowAllScreenParam) {
            let changed = false;
            for (let k in screenParam) {
                if (this.screenParam[k] != screenParam[k]) {
                    this.screenParam[k] = screenParam[k];
                    changed = true;
                }
            }
            if (changed && this.stage) {
                this.stage.setContentSize(this.stage.stageWidth, this.stage.stageHeight);
            }
        }

        public constructor() {
            super();

            ShowAllRootView._ins = this;

            this.screenParam = {};
            this.setScreenParam({
                minWidth: 720,
                maxWidth: 720,
                minHeight: 1280,
                maxHeight: 1280,
                screenTopSafe: 0,
                screenBottomSafe: 0,
            });

            this.once(egret.Event.ADDED_TO_STAGE, this.onStageAdded, this);
        }

        private onStageAdded() {
            egret.sys.screenAdapter = this;
            this.stage.setContentSize(this.stage.stageWidth, this.stage.stageHeight);

            this.stage.addChild(this.upMask);
            this.stage.addChild(this.downMask);
            this.stage.addChild(this.leftMask);
            this.stage.addChild(this.rightMask);
            this.stage.addEventListener(egret.Event.RESIZE, this.onResize, this);
            this.onResize();
        }

        $getWidth() {
            return this.explicitWidth;
        }
        $getHeight() {
            return this.explicitHeight;
        }

        private onResize() {
            this.width = Math.min(this.stage.stageWidth, this.screenParam.maxWidth);
            this.height = Math.min(this.stage.stageHeight, this.screenParam.maxHeight + this.stageTopSafe + this.stageBottomSafe);
            this.x = (this.stage.stageWidth - this.width) / 2;
            this.y = (this.stage.stageHeight - this.height) / 2;

            this.upMask.x = 0;
            this.upMask.y = 0;
            this.upMask.width = this.stage.stageWidth;
            this.upMask.height = this.y;

            this.downMask.x = 0;
            this.downMask.y = this.y + this.height;
            this.downMask.width = this.stage.stageWidth;
            this.downMask.height = this.y;

            this.leftMask.x = 0;
            this.leftMask.y = 0;
            this.leftMask.width = this.x;
            this.leftMask.height = this.stage.stageHeight;

            this.rightMask.x = this.x + this.width;
            this.rightMask.y = 0;
            this.rightMask.width = this.x;
            this.rightMask.height = this.stage.stageHeight;

            if (this.stageTopSafe) {
                this.y += this.stageTopSafe;
                this.height -= this.stageTopSafe;
            }
            if (this.stageBottomSafe) {
                this.height -= this.stageBottomSafe;
            }
            TimerManager.instance.start(this.printScreenInfo, null, this, 300, NaN);
        }

        private printScreenInfo() {
            console.log(`stage[${this.stage.stageWidth}, ${this.stage.stageHeight}], main[${this.explicitWidth}, ${this.explicitHeight}], safeArea[${this.stageTopSafe}, ${this.stageBottomSafe}]`);
        }

        calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number, contentWidth: number, contentHeight: number): egret.sys.StageDisplaySize {
            const displayWidth = screenWidth;
            const displayHeight = screenHeight;
            const topSafeRate = this.screenParam.screenTopSafe / screenHeight;
            const bottomSafeRate = this.screenParam.screenBottomSafe / screenHeight;
            //计算stage高度时先去掉安全距离，免得实际高度小于设计最小高度
            screenHeight -= this.screenParam.screenTopSafe + this.screenParam.screenBottomSafe;
            const minWidth = this.screenParam.minWidth;
            const maxWidth = Math.max(this.screenParam.maxWidth, minWidth);
            const minHeight = this.screenParam.minHeight;
            const maxHeight = Math.max(this.screenParam.maxHeight, minHeight);

            let stageWidth: number;
            let stageHeight: number;

            let ratio = screenWidth / screenHeight;
            if (ratio >= maxWidth / minHeight) {
                stageHeight = minHeight;
                stageWidth = Math.round(ratio * stageHeight);
            } else if (ratio <= minWidth / maxHeight) {
                stageWidth = minWidth;
                stageHeight = Math.round(stageWidth / ratio);
            } else {
                //中间地带，适配规则不一定，这里优先增长高度
                stageHeight = Math.round(minWidth / ratio);
                if (stageHeight > maxHeight) {
                    stageHeight = maxHeight;
                } else if (stageHeight < minHeight) {
                    stageHeight = minHeight;
                }
                stageWidth = Math.round(ratio * stageHeight);
            }
            //补回安全距离
            stageHeight = Math.round(stageHeight / (1 - topSafeRate - bottomSafeRate));
            //缓存stage值
            this._stageTopSafe = Math.round(stageHeight * topSafeRate);
            this._stageBottomSafe = Math.round(stageHeight * bottomSafeRate);

            //宽高不是2的整数倍会导致图片绘制出现问题
            if (stageWidth % 2 != 0) {
                stageWidth += 1;
            }
            if (stageHeight % 2 != 0) {
                stageHeight += 1;
            }

            return {
                stageWidth: stageWidth,
                stageHeight: stageHeight,
                displayWidth: displayWidth,
                displayHeight: displayHeight,
            };
        }
    }
}