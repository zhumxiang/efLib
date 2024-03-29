namespace eflib.sound {
    const ORIGIN_VOLUME = "__ORIGIN_VOLUME__";
    export class SoundManager {
        /** 当前播放的背景音乐 */
        private static soundBG: egret.SoundChannel = null;
        /** 当前（设定）播放的背景音乐资源名 */
        private static curBgFile: string = null;
        /** 当前播放的所有音效列表 */
        private static allEffect = {} as { [key: string]: egret.SoundChannel[] };
        /** 是否暂停中（退到后台） */
        private static _isOnPause = false;
        /** 背景音暂停时的位置 */
        private static bgPausePosition = 0;

        private static _inited = false;
        private static _init() {
            if (egret.lifecycle.stage) {
                egret.lifecycle.stage.addEventListener(egret.Event.ACTIVATE, SoundManager.onResume, SoundManager);
                egret.lifecycle.stage.addEventListener(egret.Event.DEACTIVATE, SoundManager.onPause, SoundManager);
                this._inited = true;
            }
        }

        private static muteOne(sc: egret.SoundChannel): void {
            if (ORIGIN_VOLUME in sc) {
                return;
            }
            sc[ORIGIN_VOLUME] = sc.volume;
            sc.volume = 0;
        }
        private static unMuteOne(sc: egret.SoundChannel): void {
            if (ORIGIN_VOLUME in sc) {
                sc.volume = sc[ORIGIN_VOLUME];
                delete sc[ORIGIN_VOLUME];
            }
        }

        private static _muteMusic = false;
        /** 背景音乐是否静音 */
        static get muteMusic() {
            return this._muteMusic;
        }
        static set muteMusic(value: boolean) {
            if (this._muteMusic == value) {
                return;
            }
            this._muteMusic = value;
            if (this.soundBG) {
                if (value) {
                    this.muteOne(this.soundBG);
                } else {
                    this.unMuteOne(this.soundBG);
                }
            }
        }
        private static _muteEffect = false;
        /** 音效是否静音 */
        static get muteEffect() {
            return this._muteEffect;
        }
        static set muteEffect(value: boolean) {
            if (this._muteEffect == value) {
                return;
            }
            this._muteEffect = value;
            for (let k in this.allEffect) {
                let effArr = this.allEffect[k];
                for (let sc of effArr) {
                    if (value) {
                        this.muteOne(sc);
                    } else {
                        this.unMuteOne(sc);
                    }
                }
            }
        }

        /** 清除所有音效 */
        static clearAllEffect(): void {
            for (let k in this.allEffect) {
                let list = this.allEffect[k];
                while (list.length > 0) {
                    list[0].stop();
                }
            }
        }
        /** 清除指定音效 */
        static clearEffect(file: string): void {
            let list = this.allEffect[file];
            if (!list) {
                return;
            }
            while (list.length > 0) {
                list[0].stop();
            }
        }

        /**
         * 播放背景音乐，如果当前正在播放相同音乐则忽略
         * @param file 音频资源名
         * @returns 
         */
        static playBG(file: string): Promise<egret.SoundChannel> {
            if (this.soundBG && this.curBgFile == file) {
                return Promise.resolve(null);
            }
            this.stopBG();
            return this._playBG(file, 0);
        }

        /**
         * 播放背景音乐
         * @param file 音频资源名
         * @returns 
         */
        private static _playBG(file: string, startTime: number): Promise<egret.SoundChannel> {
            this.curBgFile = file;
            this.soundBG = null;
            this.bgPausePosition = 0;
            if (!file) {
                return Promise.resolve(null);
            }
            return this.playAsync(file, startTime, 0, true, 0);
        }

        /** 停止背景音乐 */
        static stopBG(): void {
            if (this.soundBG) {
                this.soundBG.stop();
                this.soundBG = null;
            }
            this.curBgFile = "";
        }

        /** 暂停背景音乐 */
        static pauseBG(): void {
            if (this.soundBG) {
                this.bgPausePosition = this.soundBG.position;
                this.soundBG.stop();
                this.soundBG = null;
            }
        }

        static resumeBG(): void {
            if(!this.soundBG){
                this._playBG(this.curBgFile, this.bgPausePosition);
            }
        }

        /**
         * 播放音效
         * @param file 音频资源名
         * @param loops 播放次数，默认1次
         * @param maxAtSameTime 最大同时播放量，默认不限制（等同传0）
         * @returns 
         */
        static playEffect(file: string, loops = 1, maxAtSameTime?: number): Promise<egret.SoundChannel> {
            return this.playAsync(file, 0, loops, false, maxAtSameTime);
        }

        /**
         * 播放音频，如果在后台，背景音乐会等到回前台的时候播放，音效则会被忽略
         * @param file 音频资源名
         * @param startTime 起始播放位置
         * @param loops 播放次数
         * @param asBG 是否是背景音乐
         * @param maxAtSameTime 最大同时播放数量（针对音效）
         * @returns 
         */
        private static playAsync(file: string, startTime: number, loops: number, asBG: boolean, maxAtSameTime: number): Promise<egret.SoundChannel> {
            if (!this._inited) {
                this._init();
            }
            if (!file) {
                return Promise.resolve(null);
            }
            return RES.getResAsync(file).then((sound: egret.Sound) => {
                if (!sound) {
                    return;
                }
                if (this._isOnPause) {
                    return;
                }
                if (asBG) {
                    //设定的背景音已经不一样了，忽略本次播放
                    if (this.curBgFile != file) {
                        return;
                    }
                    //可能是多次播放同个背景音，其他调用已生效，忽略本次播放
                    if (this.soundBG) {
                        return;
                    }
                    sound.type = egret.Sound.MUSIC;
                    let sc = sound.play(startTime, loops);
                    if (this._muteMusic) {
                        this.muteOne(sc);
                    }
                    this.soundBG = sc;
                    return sc;
                } else {
                    let list = this.allEffect[file];
                    if (!list) {
                        list = this.allEffect[file] = [];
                    }
                    if (maxAtSameTime && list.length >= maxAtSameTime) {
                        return;
                    }
                    sound.type = egret.Sound.EFFECT;
                    let sc = sound.play(startTime, loops);
                    list.push(sc);
                    let sc_stop = sc.stop;
                    sc.stop = () => {
                        list.splice(list.indexOf(sc), 1);
                        sc_stop.call(sc);
                    };
                    sc.addEventListener(egret.Event.SOUND_COMPLETE, () => list.splice(list.indexOf(sc), 1), null);
                    if (this._muteEffect) {
                        this.muteOne(sc);
                    }
                    return sc;
                }
            }).catch(e => {
                console.warn(e);
                return null;
            });
        }

        /** 进入后台事件处理 */
        private static onPause(): void {
            this._isOnPause = true;
            if (this.soundBG) {
                this.bgPausePosition = this.soundBG.position;
                this.soundBG.stop();
                this.soundBG = null;
            } else {
                this.bgPausePosition = 0;
            }
            this.clearAllEffect();
        }

        /** 回到前台事件处理 */
        private static onResume(): void {
            this._isOnPause = false;
            this._playBG(this.curBgFile, this.bgPausePosition);
        }
    }
}