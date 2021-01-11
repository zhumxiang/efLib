namespace eflib {
    /** 定时器回调 */
    export type TimerCallback = (dt: number) => void;
    /** 定时器任务 */
    type TimerTask = {
        /** 下次触发的时间，单位毫秒 */
        nextTime: number;
        /** 上次触发的时间，单位毫秒 */
        lastTime: number;
        /** 伪当前时间，单位毫秒，这个字段受时间轴缩放影响 */
        currentTime: number;
        /** 循环触发时间间隔，单位毫秒 */
        interval: number;
        /** 回调函数 */
        callback: TimerCallback;
        /** 回调函数thisArg */
        thisObj: egret.DisplayObject;
        /** 是否标记为关闭 */
        killed: boolean;
    }
    /** 全局定时器 */
    export class TimerManager {
        private static _instance = new TimerManager();
        /** 获取默认实例 */
        static get instance() {
            return this._instance;
        }
        /** 白鹭定时器，每一帧回调 */
        private _timer = new egret.Timer(0);
        /** 定时器任务列表 */
        private _list = [] as TimerTask[];
        /** 定时器任务临时列表，当正在触发定时器时又添加另一个定时器那么先存到这里 */
        private _listTmp = [] as TimerTask[];
        /** 是否正在触发定时器 */
        private _updating = false;
        /** 对象和移除函数的集合，当对象被移出舞台时，自动移除定时器 */
        private _remover = {};
        /** 定时器时间轴比例 */
        public timeScale = 1;
        constructor() {
            this._timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
        }

        /** 定时器内部回调 */
        private onTimer() {
            this._updating = true;
            let now = egret.getTimer();
            //存储一下时间轴比例，避免updating过程中被修改
            let scale = this.timeScale;
            for (let i = 0; i < this._list.length; ++i) {
                let item = this._list[i];
                if (item.killed) {
                    this._list.splice(i--, 1);
                    continue;
                }
                item.currentTime += (now - item.currentTime) * scale;
                if (item.currentTime < item.nextTime) {
                    continue;
                }
                item.callback.call(item.thisObj, item.currentTime - item.lastTime);
                if (isNaN(item.interval)) {
                    this._list.splice(i--, 1);
                    continue;
                }
                item.nextTime = now + item.interval;
                item.lastTime = now;
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

        /**
         * 启动一个定时器任务
         * @param callback 回调函数
         * @param thisObj 回调this
         * @param delay 首次执行延迟时间，单位毫秒
         * @param interval 循环执行间隔时间，单位毫秒，传NaN表示不循环
         */
        start(callback: TimerCallback, thisObj: egret.DisplayObject, delay: number, interval: number) {
            if (thisObj && !thisObj.stage) {
                throw 'you should add listener after object added to stage'
            }
            let now = egret.getTimer();
            let newItem: TimerTask = {
                nextTime: now + delay,
                lastTime: now,
                currentTime: now,
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

        /**
         * 停止一个定时器任务
         * @param callback 回调函数
         * @param thisObj 回调this
         */
        stop(callback: TimerCallback, thisObj: egret.DisplayObject) {
            for (let item of this._listTmp) {
                if (!item.killed && (item.callback == callback || callback == null) && item.thisObj == thisObj) {
                    item.killed = true;
                    break;
                }
            }
            for (let item of this._list) {
                if (!item.killed && (item.callback == callback || callback == null) && item.thisObj == thisObj) {
                    item.killed = true;
                    break;
                }
            }
        }

        /**
         * 插入一个定时器任务
         * @param newItem 定时器任务
         */
        private insert(newItem: TimerTask) {
            let list = this._updating ? this._listTmp : this._list;
            for (let i = 0; i < list.length; ++i) {
                let item = list[i];
                if (item.callback == newItem.callback && item.thisObj == newItem.thisObj) {
                    list[i] = newItem;
                    return;
                }
            }
            list.push(newItem);
        }
    }
}