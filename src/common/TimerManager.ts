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
        thisArg: object;
        /** 生命周期关联对象 */
        bindObj: egret.DisplayObject;
        /** 是否标记为关闭 */
        killed: boolean;
    }
    /** 定时器 */
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
        /** 定时器时间轴比例 */
        public timeScale = 1;
        constructor() {
            this._timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
        }

        /** 定时器内部回调 */
        private onTimer(): void {
            this._updating = true;
            let now = egret.getTimer();
            //存储一下时间轴比例，避免updating过程中被修改
            let scale = this.timeScale;
            for (let item of this._list) {
                if (item.killed) {
                    continue;
                }
                if (item.bindObj && !item.bindObj.stage) {
                    continue;
                }
                item.currentTime += (now - item.currentTime) * scale;
                if (item.currentTime < item.nextTime) {
                    continue;
                }
                item.callback.call(item.thisArg, item.currentTime - item.lastTime);
                if (isNaN(item.interval)) {
                    item.killed = true;
                    continue;
                }
                item.nextTime = now + item.interval;
                item.lastTime = now;
            }
            for (let i = this._list.length - 1; i >= 0; --i) {
                let item = this._list[i];
                if (item.killed) {
                    this._list.splice(i, 1);
                } else if (item.bindObj && !item.bindObj.stage) {
                    this._list.splice(i, 1);
                    this.insert(item);
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

        /**
         * 启动一个定时器任务
         * @param callback 回调函数
         * @param bindObj 生命周期关联对象
         * @param thisArg 回调this，不传则为bindObj
         * @param delay 首次执行延迟时间，单位毫秒，默认为0
         * @param interval 循环执行间隔时间，单位毫秒，传NaN表示不循环，默认为0
         */
        start(callback: TimerCallback, bindObj: egret.DisplayObject, thisArg?: object, delay?: number, interval?: number): TimerCallback;
        start(callback: TimerCallback, bindObj: egret.DisplayObject, delay?: number, interval?: number): TimerCallback;
        start(callback: TimerCallback, bindObj: egret.DisplayObject, thisArg?: object | number, delay = 0, interval = 0): TimerCallback {
            if (thisArg === void 0) {
                thisArg = bindObj;
            } else if (typeof thisArg == 'number') {
                interval = delay;
                delay = thisArg;
                thisArg = bindObj;
            }
            let now = egret.getTimer();
            let newItem: TimerTask = {
                nextTime: now + delay,
                lastTime: now,
                currentTime: now,
                interval: interval,
                callback: callback,
                thisArg: thisArg,
                bindObj: bindObj,
                killed: false,
            };
            this.insert(newItem);
            this._timer.start();
            return callback;
        }

        /**
         * 停止一个定时器任务
         * @param callback 回调函数
         * @param thisArg 回调this
         */
        stop(callback: TimerCallback, thisArg: object): void {
            for (let item of this._listTmp) {
                if (!item.killed && (item.callback == callback || callback == null) && item.thisArg == thisArg) {
                    item.killed = true;
                    break;
                }
            }
            for (let item of this._list) {
                if (!item.killed && (item.callback == callback || callback == null) && item.thisArg == thisArg) {
                    item.killed = true;
                    break;
                }
            }
        }

        /**
         * 插入一个定时器任务
         * @param newItem 定时器任务
         */
        private insert(newItem: TimerTask): void {
            if (newItem.bindObj && !newItem.bindObj.stage) {
                newItem.bindObj.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
                    this.insert(newItem);
                }, null);
                return;
            }
            let list = this._updating ? this._listTmp : this._list;
            for (let i = 0; i < list.length; ++i) {
                let item = list[i];
                if (item.callback == newItem.callback && item.thisArg == newItem.thisArg) {
                    list[i] = newItem;
                    return;
                }
            }
            list.push(newItem);
        }
    }
}