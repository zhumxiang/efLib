namespace cglib.base {
    export type TimerCallback = (dt: number) => void;
    type TimerItem = {
        nextTime: number;
        lastTime: number;
        interval: number;
        callback: TimerCallback;
        thisObj: egret.DisplayObject;
        killed: boolean;
    }
    function timerItemSorter(a: TimerItem, b: TimerItem) {
        return a.nextTime - b.nextTime;
    }
    export class TimerManager {
        private static _instance = new TimerManager();
        static get instance() {
            return this._instance;
        }
        private _timer = new egret.Timer(0);
        private _list = [] as TimerItem[];
        private _listTmp = [] as TimerItem[];
        private _updating = false;
        private _killCount = 0;
        private _remover = {};
        private _dirtySort = false;
        constructor() {
            this._timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
        }
        private onTimer() {
            this._updating = true;
            let now = egret.getTimer();
            if (this._dirtySort) {
                this._list.sort(timerItemSorter);
                this._dirtySort = false;
            }
            for (let i = 0; i < this._list.length; ++i) {
                let item = this._list[i];
                if (item.killed) {
                    this._list.splice(i--, 1);
                    --this._killCount;
                    continue;
                }
                if (now < item.nextTime) {
                    if (this._killCount == 0) {
                        break;
                    } else {
                        continue;
                    }
                }
                item.callback.call(item.thisObj, now - item.lastTime);
                if (isNaN(item.interval)) {
                    this._list.splice(i--, 1);
                    continue;
                }
                item.nextTime = now + item.interval;
                item.lastTime = now;
                if (item.interval > 0) {
                    this._dirtySort = true;
                }
            }
            this._updating = false;
            while (this._listTmp.length > 0) {
                let newItem = this._listTmp.pop();
                if (!newItem.killed) {
                    this.insert(newItem);
                }
            }
            if (this._list.length == 0) {
                this._timer.stop();
            }
        }
        start(callback: TimerCallback, thisObj: egret.DisplayObject, delay: number, interval: number) {
            if (thisObj && !thisObj.stage) {
                throw 'you should add listener after object added to stage'
            }
            let now = egret.getTimer();
            let newItem: TimerItem = {
                nextTime: now + delay,
                lastTime: now,
                interval: interval,
                callback: callback,
                thisObj: thisObj,
                killed: false,
            };
            this.insert(newItem);
            this._timer.start();

            if (thisObj && !this._remover[thisObj.hashCode]) {
                this._remover[thisObj.hashCode] = 1;
                thisObj.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
                    delete this._remover[thisObj.hashCode];
                    this.stop(null, thisObj);
                }, null);
            }
            return callback;
        }
        stop(callback: TimerCallback, thisObj: egret.DisplayObject) {
            for (let item of this._listTmp) {
                if (!item.killed && (item.callback == callback || callback == null) && item.thisObj == thisObj) {
                    item.killed = true;
                    break;
                }
            }
            for (let item of this._list) {
                if (!item.killed && (item.callback == callback || callback == null) && item.thisObj == thisObj) {
                    ++this._killCount;
                    item.killed = true;
                    break;
                }
            }
        }
        private insert(newItem: TimerItem) {
            let list = this._updating ? this._listTmp : this._list;
            for (let i = 0; i < list.length; ++i) {
                let item = list[i];
                if (item.callback == newItem.callback && item.thisObj == newItem.thisObj) {
                    if (item.killed && list == this._list) {
                        --this._killCount;
                    }
                    list[i] = newItem;
                    this._dirtySort = true;
                    return;
                }
            }
            list.push(newItem);
            this._dirtySort = true;
        }
    }
}