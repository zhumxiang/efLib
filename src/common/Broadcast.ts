namespace eflib {
    type ListenerInfo = {
        listener: (...data: any[]) => void,
        thisObj: egret.DisplayObject,
    }
    export class Broadcast {
        private static _instance = new Broadcast();
        static get instance() {
            return this._instance;
        }
        private _map = {} as { [key: string]: ListenerInfo[] };
        private _remover = {};
        on(key: string, listener: (...data: any[]) => void, thisObj: egret.DisplayObject) {
            if (thisObj && !thisObj.stage) {
                throw 'you should add listener after object added to stage'
            }
            if (!this._map[key]) {
                this._map[key] = [];
            }
            for (let info of this._map[key]) {
                if (info.listener == listener && info.thisObj == thisObj) {
                    return;
                }
            }
            this._map[key].push({
                listener,
                thisObj,
            });
            if (thisObj && !this._remover[thisObj.hashCode]) {
                this._remover[thisObj.hashCode] = 1;
                thisObj.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
                    delete this._remover[thisObj.hashCode];
                    this.off(thisObj);
                }, null);
            }
        }

        off(thisObj: egret.DisplayObject) {
            for (let k in this._map) {
                let list = this._map[k];
                for (let i = list.length - 1; i >= 0; --i) {
                    if (list[i].thisObj == thisObj) {
                        list.splice(i, 1);
                    }
                }
            }
        }

        dispatch(key: string, ...data: any[]) {
            let list = this._map[key];
            if (list) {
                let tmp = list.length > 1 ? [...list] : list;
                for (let info of tmp) {
                    info.listener.apply(info.thisObj, data);
                }
            }
        }
    }
}