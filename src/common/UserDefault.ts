namespace eflib {
    /** LocalStorage的封装，支持数组和表，请勿存取二进制数据。同时考虑到小游戏平台对LocalStorage的限制，应避免存取大量数据 */
    export class UserDefault {
        /**
         * 读取一个值
         * @param key 键
         * @param userKey 用户前缀
         * @returns 值
         */
        static read<T>(key: string, userKey?: string | number, defaultVal?: T): T {
            key = genFullKey(key, userKey);
            try {
                return JSON.parse(egret.localStorage.getItem(key));
            } catch (e) {
                console.error(e);
                return defaultVal;
            }
        }

        /**
         * 写入一个值
         * @param key 键
         * @param value 值，写入null将删除数据
         */
        static write<T>(key: string, value: T, userKey?: string | number): void {
            key = genFullKey(key, userKey);
            if (value == null) {
                egret.localStorage.removeItem(key);
            } else {
                try {
                    egret.localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.error(e);
                }
            }
        }

        /** 清除所有数据 */
        static clear(): void {
            egret.localStorage.clear();
        }
    }

    /**
     * 根据键名和用户标识生成完整键名
     * @param key 
     * @param userKey 
     */
    function genFullKey(key: string, userKey: string | number) {
        key = "@" + key;
        if (userKey != null) {
            key = userKey + key;
        }
        return key;
    }
}