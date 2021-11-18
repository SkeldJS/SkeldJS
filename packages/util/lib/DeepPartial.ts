export type DeepPartial<T> = T extends Record<any, any> ? Partial<{
    [K in keyof T]: DeepPartial<T[K]>
}> : T;
