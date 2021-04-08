namespace eflib {
    /** 监听信息 */
    type ListenerInfo = {
        /** 回调函数 */
        listener: (...data: any[]) => void,
        /** 回调函数this */
        thisArg: any,
        /** 生命周期关联对象 */
        bindObj: egret.DisplayObject,
    }
    /** 广播器 */
    export class Broadcast {
        private static _instance = new Broadcast();
        static get instance() {
            return this._instance;
        }
        private _map = {} as { [key: string]: ListenerInfo[] };
        private _remover = {};

        /**
         * 添加广播监听
         * @param key 广播名
         * @param listener 回调函数
         * @param bindObj 生命周期关联对象
         * @param thisArg 回调函数this，不传则为bindObj
         * @returns 
         */
        on(key: string, listener: (...data: any[]) => void, bindObj: egret.DisplayObject, thisArg: any = bindObj): void {
            if (bindObj && !bindObj.stage) {
                throw 'you should add listener after bindObj added to stage';
            }
            if (!this._map[key]) {
                this._map[key] = [];
            }
            for (let info of this._map[key]) {
                if (info.listener == listener && info.thisArg == thisArg) {
                    return;
                }
            }
            this._map[key].push({
                listener,
                thisArg: thisArg,
                bindObj,
            });
            if (bindObj && !this._remover[bindObj.hashCode]) {
                this._remover[bindObj.hashCode] = 1;
                bindObj.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
                    delete this._remover[bindObj.hashCode];
                    this.off(thisArg);
                }, null);
            }
        }

        /**
         * 取消广播监听，暂时只支持针对thisArg全部取消
         * @param thisArg 
         */
        off(thisArg: any): void {
            for (let k in this._map) {
                let list = this._map[k];
                for (let i = list.length - 1; i >= 0; --i) {
                    if (list[i].thisArg == thisArg) {
                        list.splice(i, 1);
                    }
                }
            }
        }

        /**
         * 发布广播
         * @param key 广播名
         * @param data 自定义数据
         */
        dispatch(key: string, ...data: any[]): void {
            let list = this._map[key];
            if (list) {
                let tmp = list.length > 1 ? [...list] : list;
                for (let info of tmp) {
                    info.listener.apply(info.thisArg, data);
                }
            }
        }
    }
}