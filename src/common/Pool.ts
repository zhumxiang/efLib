namespace eflib {
    export interface IPoolRecycleAble {
        $onPoolRecycle(): void;
    }
    export interface IPoolObj extends IPoolRecycleAble {
        $onPoolCreate(...params: any[]): void;
    }
    export interface PoolObjClass<T extends IPoolRecycleAble> extends ClassP0<T & IPoolObj> { }
    export interface PoolObjClassP0<T extends IPoolRecycleAble> extends ClassP0<T & { $onPoolCreate(): void }> { }
    export interface PoolObjClassP1<T extends IPoolRecycleAble, P1> extends ClassP0<T & { $onPoolCreate(p1: P1): void }> { }
    export interface PoolObjClassP2<T extends IPoolRecycleAble, P1, P2> extends ClassP0<T & { $onPoolCreate(p1: P1, p2: P2): void }> { }
    export interface PoolObjClassP3<T extends IPoolRecycleAble, P1, P2, P3> extends ClassP0<T & { $onPoolCreate(p1: P1, p2: P2, p3: P3): void }> { }
    export interface PoolObjClassP4<T extends IPoolRecycleAble, P1, P2, P3, P4> extends ClassP0<T & { $onPoolCreate(p1: P1, p2: P2, p3: P3, p4: P4): void }> { }
    export interface PoolObjClassP5<T extends IPoolRecycleAble, P1, P2, P3, P4, P5> extends ClassP0<T & { $onPoolCreate(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): void }> { }
    export interface PoolObjClassP6<T extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6> extends ClassP0<T & { $onPoolCreate(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6): void }> { }
    export interface PoolObjClassP7<T extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6, P7> extends ClassP0<T & { $onPoolCreate(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7): void }> { }
    export interface PoolObjClassP8<T extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6, P7, P8> extends ClassP0<T & { $onPoolCreate(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8): void }> { }
    export class Pool<T extends IPoolRecycleAble>{
        private _list = [] as T[];
        recycle(obj: T) {
            obj.$onPoolRecycle();
            this._list.push(obj);
        }
        private constructor(private _cls: PoolObjClass<T>) {
        }
        static newPool<U extends IPoolRecycleAble>(cls: PoolObjClassP0<U>): Pool<U>;
        static newPool<U extends IPoolRecycleAble, P1>(cls: PoolObjClassP1<U, P1>): PoolP1<U, P1>;
        static newPool<U extends IPoolRecycleAble, P1, P2>(cls: PoolObjClassP2<U, P1, P2>): PoolP2<U, P1, P2>;
        static newPool<U extends IPoolRecycleAble, P1, P2, P3>(cls: PoolObjClassP3<U, P1, P2, P3>): PoolP3<U, P1, P2, P3>;
        static newPool<U extends IPoolRecycleAble, P1, P2, P3, P4>(cls: PoolObjClassP4<U, P1, P2, P3, P4>): PoolP4<U, P1, P2, P3, P4>;
        static newPool<U extends IPoolRecycleAble, P1, P2, P3, P4, P5>(cls: PoolObjClassP5<U, P1, P2, P3, P4, P5>): PoolP5<U, P1, P2, P3, P4, P5>;
        static newPool<U extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6>(cls: PoolObjClassP6<U, P1, P2, P3, P4, P5, P6>): PoolP6<U, P1, P2, P3, P4, P5, P6>;
        static newPool<U extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6, P7>(cls: PoolObjClassP7<U, P1, P2, P3, P4, P5, P6, P7>): PoolP7<U, P1, P2, P3, P4, P5, P6, P7>;
        static newPool<U extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6, P7, P8>(cls: PoolObjClassP8<U, P1, P2, P3, P4, P5, P6, P7, P8>): PoolP8<U, P1, P2, P3, P4, P5, P6, P7, P8>;
        static newPool<U extends IPoolRecycleAble>(cls: PoolObjClass<U>): Pool<U>;
        static newPool<U extends IPoolRecycleAble>(cls: PoolObjClass<U>) {
            return new Pool(cls);
        }
        create(...params: any[]) {
            let obj: T;
            if (this._list.length > 0) {
                obj = this._list.pop();
            } else {
                obj = new this._cls();
            }
            this._cls.apply(obj, params);
            return obj;
        }
    }
    export interface Pool<T extends IPoolRecycleAble> { create(...params: any[]): T; }
    export interface PoolP0<T extends IPoolRecycleAble> extends Pool<T> { create(): T; }
    export interface PoolP1<T extends IPoolRecycleAble, P1> extends Pool<T> { create(p1: P1): T; }
    export interface PoolP2<T extends IPoolRecycleAble, P1, P2> extends Pool<T> { create(p1: P1, p2: P2): T; }
    export interface PoolP3<T extends IPoolRecycleAble, P1, P2, P3> extends Pool<T> { create(p1: P1, p2: P2, p3: P3): T; }
    export interface PoolP4<T extends IPoolRecycleAble, P1, P2, P3, P4> extends Pool<T> { create(p1: P1, p2: P2, p3: P3, p4: P4): T; }
    export interface PoolP5<T extends IPoolRecycleAble, P1, P2, P3, P4, P5> extends Pool<T> { create(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): T; }
    export interface PoolP6<T extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6> extends Pool<T> { create(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6): T; }
    export interface PoolP7<T extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6, P7> extends Pool<T> { create(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7): T; }
    export interface PoolP8<T extends IPoolRecycleAble, P1, P2, P3, P4, P5, P6, P7, P8> extends Pool<T> { create(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8): T; }
}