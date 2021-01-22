import { EventEmitter } from "events";

export type TypedEvents = Record<string, (...params: any) => void>;

type EventName<T extends TypedEvents> = string & keyof T;

export interface TypedEmitter<T extends TypedEvents> extends EventEmitter {
    events: T;

    on<K extends EventName<T>>(event: K, listener: T[K]);
    once<K extends EventName<T>>(event: K, listener: T[K]);
    off<K extends EventName<T>>(event: K, listener: T[K]);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class TypedEmitter<T extends TypedEvents> extends EventEmitter {
    constructor() {
        super();
    }
}

export type ExtractEvents<T extends TypedEmitter<TypedEvents>> = T extends { events: infer D } ? D : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ExtractParameters<T extends (...any) => void> = T extends (...args: infer T) => void ? T : never;

export type PrependParameters<P, T extends (...params: any) => void> = (_: P, ...params: ExtractParameters<T>) => void;

export type PropagatedEvents<P, T extends TypedEvents> = {
    [ key in EventName<T> ]: PrependParameters<P, T[key]>
}

export type PropagatedEmitter<P extends TypedEmitter<any>> = PropagatedEvents<P,ExtractEvents<P>>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class PropagatableEmitter<P, C extends TypedEmitter<any>, T extends TypedEvents> extends TypedEmitter<PropagatedEvents<P, ExtractEvents<C>> & T> {
    constructor() {
        super();
    }
}
