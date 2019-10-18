namespace cglib.sound {
    export class SoundMgr {
        private static cache = {};

        private static soundBG: egret.SoundChannel = null;
        private static curBgFile: string = null;
        private static _isOnPause = false;
        public static get isOnPause() {
            return this._isOnPause;
        }

        private static _mute = false;
        public static set mute(value: boolean) {
            if (this._mute != value) {
                this._mute = value;
                if (value) {
                    if (!this._isOnPause) {
                        this.onPause();
                        this._isOnPause = false;
                    }
                } else {
                    if (!this._isOnPause) {
                        this.onResume();
                    }
                }
            }
        }

        private static effArr = [] as egret.SoundChannel[];
        private static clearEff() {
            while (this.effArr.length > 0) {
                this.effArr[0].stop();
            }
        }
        private static removeEff(sc: egret.SoundChannel) {
            for (let i = 0, n = this.effArr.length; i < n; ++i) {
                if (this.effArr[i] == sc) {
                    this.effArr.splice(i, 1);
                    break;
                }
            }
        }

        public static playBG(file: string) {
            if (this.soundBG != null && this.curBgFile == file) {
                return;
            }
            this.stopBG();
            this.curBgFile = file;
            this.soundBG = this.play(file, 0, 0, true);
        }

        public static stopBG() {
            if (this.soundBG != null) {
                this.soundBG.stop();
                this.soundBG = null;
                this.curBgFile = "";
            }
        }

        public static playEffect(file: string, loops?: number): egret.SoundChannel {
            let sc = this.play(file, 0, loops === undefined ? 1 : loops);
            if (sc) {
                this.effArr.push(sc);
                let sc_stop = sc.stop;
                sc.stop = () => {
                    this.removeEff(sc);
                    sc_stop.call(sc);
                };
                sc.addEventListener(egret.Event.SOUND_COMPLETE, () => this.removeEff(sc), null);
            }
            return sc
        }

        private static play(file: string, startTime?: number, loops?: number, asBG?: boolean): egret.SoundChannel {
            if (this._mute || this._isOnPause) {
                return;
            }
            let sound = this.load(file);
            if (sound != null) {
                sound.type = asBG ? egret.Sound.MUSIC : egret.Sound.EFFECT;
                return sound.play(startTime, loops);
            } else {
                return null;
            }
        }

        public static load(file: string): egret.Sound {
            let sound = this.cache[file] as egret.Sound;
            if (sound == null) {
                sound = RES.getRes(file);
                if (sound != null) {
                    this.cache[file] = sound;
                }
            }
            return sound;
        }

        public static onPause() {
            this._isOnPause = true;
            if (this.soundBG != null) {
                this.soundBG.stop();
                this.soundBG = null;
            }
            this.clearEff();
        }

        public static onResume() {
            this._isOnPause = false;
            if (this.soundBG != null) {
                this.soundBG.stop();
            }
            if (this.curBgFile) {
                this.soundBG = this.play(this.curBgFile, 0, 0, true);
            }
        }
    }
}