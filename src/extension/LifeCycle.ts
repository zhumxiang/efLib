declare namespace egret {
    /** @extension 扩展了生命周期方法 */
    interface DisplayObject {
        /** 添加到舞台时触发 */
        onEnter(): void;
        /** 离开舞台时触发 */
        onExit(): void;
        /** 全局visible */
        readonly visibleInHierarchy: boolean;
        onVisibleInHierarchyChanged(): void;
    }
}
namespace eflib {
    const $onAddToStage = egret.DisplayObject.prototype.$onAddToStage;
    const $onRemoveFromStage = egret.DisplayObject.prototype.$onRemoveFromStage;
    const $setVisible = egret.DisplayObject.prototype.$setVisible;
    class DisplayObjectEx extends egret.DisplayObject {
        parent: egret.DisplayObjectContainer & DisplayObjectEx;
        $children: DisplayObjectEx[];
        onEnter() { }
        onExit() { }
        $onAddToStage(stage: egret.Stage, nestLevel: number) {
            $onAddToStage.call(this, stage, nestLevel);
            updateVisible(this, void 0, false);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onEnter, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onExit, this);
        }
        $onRemoveFromStage() {
            $onRemoveFromStage.call(this);
            this._visibleInHierarchy = void 0;
        }
        _visibleInHierarchy: boolean;
        get visibleInHierarchy() {
            return this._visibleInHierarchy;
        }
        onVisibleInHierarchyChanged() { }
        $setVisible(value: boolean) {
            if (this.$visible == value) {
                return;
            }
            $setVisible.call(this, value);
            if (this.stage) {
                updateVisible(this, void 0, true);
            }
        }
    }
    function updateVisible(obj: DisplayObjectEx, parentVal: boolean, recursion: boolean) {
        if (parentVal === void 0) {
            if (!obj.parent || obj.parent._visibleInHierarchy === void 0) {
                parentVal = true;
            } else {
                parentVal = obj.parent._visibleInHierarchy;
            }
        }
        let newValue = parentVal && obj.visible;
        if (obj._visibleInHierarchy != newValue) {
            obj._visibleInHierarchy = newValue;
            obj.onVisibleInHierarchyChanged();
            if (recursion) {
                if (obj.$children) {
                    for (let child of obj.$children) {
                        updateVisible(child, newValue, true);
                    }
                }
            }
        }
    }
    eflib.extension(DisplayObjectEx, egret.DisplayObject);
}