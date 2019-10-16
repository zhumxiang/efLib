namespace cglib {
    export class ShowAllRootView extends eui.Group implements egret.sys.IScreenAdapter {
        private static _ins: ShowAllRootView;
        public static getInstance() {
            return ShowAllRootView._ins;
        }

        private upMask = new eui.Rect();
        private downMask = new eui.Rect();
        private leftMask = new eui.Rect();
        private rightMask = new eui.Rect();

        private screenParam = {
            minWidth: NaN,
            maxWidth: NaN,
            minHeight: NaN,
            maxHeight: NaN,
        }
        public setScreenParam(minWidth: number, maxWidth: number, minHeight: number, maxHeight: number) {
            this.screenParam.minWidth = minWidth;
            this.screenParam.maxWidth = maxWidth;
            this.screenParam.minHeight = minHeight;
            this.screenParam.maxHeight = maxHeight;
            if (this.stage) {
                this.onResize();
            }
        }

        public constructor() {
            super();

            ShowAllRootView._ins = this;

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
        }

        calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number, contentWidth: number, contentHeight: number): egret.sys.StageDisplaySize {
            const minWidth = this.screenParam.minWidth;
            const maxWidth = this.screenParam.maxWidth;
            const minHeight = this.screenParam.minHeight;
            const maxHeight = this.screenParam.maxHeight;

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