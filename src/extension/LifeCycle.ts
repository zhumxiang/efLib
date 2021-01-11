namespace egret {
    const $onAddToStage = egret.DisplayObject.prototype.$onAddToStage;
    /** @extension 扩展了生命周期方法 */
    export interface DisplayObject {
        /** 添加到舞台时触发 */
        onEnter(): void;
        /** 离开舞台时触发 */
        onExit(): void;
    }
    class DisplayObjectEx extends DisplayObject {
        onEnter() { }
        onExit() { }
        $onAddToStage(stage: egret.Stage, nestLevel: number) {
            $onAddToStage.call(this, stage, nestLevel);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onEnter, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onExit, this);
        }
    }
    eflib.extension(DisplayObjectEx, DisplayObject);
}