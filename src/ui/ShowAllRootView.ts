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
        topSafe?: number,
        /** 底部安全距离 */
        bottomSafe?: number,
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
                this.onResize();
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
                topSafe: 0,
                bottomSafe: 0,
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
            this.height = Math.min(this.stage.stageHeight, this.screenParam.maxHeight);
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

            if (this.screenParam.topSafe) {
                this.y += this.screenParam.topSafe;
                this.height -= this.screenParam.topSafe;
            }
            if (this.screenParam.bottomSafe) {
                this.height -= this.screenParam.bottomSafe;
            }
        }

        calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number, contentWidth: number, contentHeight: number): egret.sys.StageDisplaySize {
            const minWidth = this.screenParam.minWidth;
            const maxWidth = Math.max(this.screenParam.maxWidth, minWidth);
            //最小高度再加上安全距离，免得实际高度小于设计最小高度
            const minHeight = this.screenParam.minHeight + this.screenParam.topSafe + this.screenParam.bottomSafe;
            const maxHeight = Math.max(this.screenParam.maxHeight, minHeight);

            let stageWidth = contentWidth;
            let stageHeight = contentHeight;

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
                displayWidth: screenWidth,
                displayHeight: screenHeight
            };
        }
    }
}