namespace cglib.base {
    export interface Class<T> {
        new(...params: any[]): T;
    }
    export interface ClassP0<T> {
        new(): T;
    }
    export interface ClassP1<T, P1> {
        new(p1: P1): T;
    }
    export interface ClassP2<T, P1, P2> {
        new(p1: P1, p2: P2): T;
    }
    export interface ClassP3<T, P1, P2, P3> {
        new(p1: P1, p2: P2, p3: P3): T;
    }
    export interface ClassP4<T, P1, P2, P3, P4> {
        new(p1: P1, p2: P2, p3: P3, p4: P4): T;
    }
    export interface ClassP5<T, P1, P2, P3, P4, P5> {
        new(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): T;
    }
    export interface ClassP6<T, P1, P2, P3, P4, P5, P6> {
        new(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6): T;
    }
    export interface ClassP7<T, P1, P2, P3, P4, P5, P6, P7> {
        new(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7): T;
    }
    export interface ClassP8<T, P1, P2, P3, P4, P5, P6, P7, P8> {
        new(p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8): T;
    }
    export function isSameClass(cls1: Class<object>, cls2: Class<object>) {
        return cls1 == cls2;
    }
}