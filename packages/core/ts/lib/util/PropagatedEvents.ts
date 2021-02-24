export declare type PropagatedEvents<Child extends Record<string, any>, Prepend extends Record<string, any>> = {
    [T in keyof Child]: Child[T] & Prepend
}
