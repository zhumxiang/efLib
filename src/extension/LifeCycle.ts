declare namespace egret {
    /** @extension 扩展了生命周期方法 */
    interface DisplayObject {
        /** 添加到舞台时触发 */
        onEnter(): void;
        /** 离开舞台时触发 */
        onExit(): void;
        /** 全局visible */
        readonly visibleInHierarchy: boolean;
    }
}
namespace eflib {
    const $onAddToStage = egret.DisplayObject.prototype.$onAddToStage;
    class DisplayObjectEx extends egret.DisplayObject {
        parent: egret.DisplayObjectContainer & DisplayObjectEx;
        $children: DisplayObjectEx[];
        onEnter() { }
        onExit() { }
        $onAddToStage(stage: egret.Stage, nestLevel: number) {
            $onAddToStage.call(this, stage, nestLevel);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onEnter, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onExit, this);
        }
        get visibleInHierarchy() {
            if (!this.stage) {
                return false;
            }
            let target: egret.DisplayObject = this;
            while (target) {
                if (!target.visible) {
                    return false;
                }
                target = target.parent;
            }
            return true;
        }
    }
    eflib.extension(DisplayObjectEx, egret.DisplayObject);
}