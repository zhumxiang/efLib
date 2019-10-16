namespace cglib.sound {
    export class SoundMgr {
        private static cache = {};

        private static soundBG: egret.SoundChannel = null;
        private static curBgFile: string = null;
        private static _isOnPause = false;
        public static get isOnPause() {
            return this._isOnPause;
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
            return this.play(file, 0, loops || 1);
        }

        private static play(file: string, startTime?: number, loops?: number, asBG?: boolean): egret.SoundChannel {
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