namespace eflib {
    /**
     * 将子类方法/访问器覆盖父类，通常用于对框架类的扩展
     * @注意 子类中不能使用super
     * @param ex 子类
     * @param orig 父类
     */
    export function extension<ExClass extends OrigClass, OrigClass>(ex: Class<ExClass>, orig: Class<OrigClass>) {
        for (let func of Object.getOwnPropertyNames(ex.prototype)) {
            if (func == "constructor") {
                continue;
            }
            let propertyDesc = Object.getOwnPropertyDescriptor(ex.prototype, func);
            if (!propertyDesc) {
                continue;
            }
            if (propertyDesc.get || propertyDesc.set) {
                Object.defineProperty(orig.prototype, func, propertyDesc);
                continue;
            }
            if (typeof (ex.prototype[func]) == "function") {
                orig.prototype[func] = ex.prototype[func];
            }
        }
    }
}