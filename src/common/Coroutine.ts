namespace eflib {
    /** 协程 */
    export class Coroutine {
        private runFlag = 0;
        private lastValue: any;
        readonly promise: Promise<any>;
        private resolve: (data: any) => void;
        private reject: (data: any) => void;
        private itrList: Generator[];
        private bindObj: egret.DisplayObject;
        /**
         * @param itr 协程迭代器
         * @param bindObj 绑定对象生命周期
         * @param startImmediate 是否立即执行协程，默认true
         */
        constructor(itr: Generator, bindObj: egret.DisplayObject, startImmediate = true) {
            this.itrList = [itr];
            this.bindObj = bindObj;
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            if (startImmediate) {
                this.start();
            }
        }
        /** 启动协程 */
        start() {
            if (this.runFlag > 0) {
                return;
            }
            this.runFlag = -this.runFlag + 1;
            this.run();
        }
        /** 停止协程 */
        stop() {
            if (this.runFlag <= 0) {
                --this.runFlag;
                return;
            }
            this.runFlag = -this.runFlag;
        }
        private async run() {
            try {
                let runFlag = this.runFlag;
                let itr = this.itrList[this.itrList.length - 1];
                if (!itr) {
                    return;
                }
                while (runFlag == this.runFlag) {
                    if (this.bindObj && !this.bindObj.stage) {
                        this.stop();
                        runFlag = this.runFlag;
                        this.bindObj.once(egret.Event.ADDED_TO_STAGE, () => {
                            if (runFlag == this.runFlag) {
                                this.start();
                            }
                        }, null);
                        return;
                    }
                    let ret = itr.next(this.lastValue);
                    if (ret.done) {
                        this.itrList.pop();
                        itr = this.itrList[this.itrList.length - 1];
                    }
                    this.lastValue = await ret.value;
                    if (this.lastValue && typeof this.lastValue == 'object') {
                        let valueAsGenerator = this.lastValue as Generator;
                        if (typeof valueAsGenerator.next == 'function' && typeof valueAsGenerator.throw == 'function' && typeof valueAsGenerator.return == 'function') {
                            this.itrList.push(valueAsGenerator);
                            itr = valueAsGenerator;
                        }
                    }
                    if (!itr) {
                        this.resolve(this.lastValue);
                        return;
                    }
                }
            } catch (e) {
                this.reject(e);
            }
        }
    }
}