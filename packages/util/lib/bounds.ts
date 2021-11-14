export const SIZES = {
    uint8: 1,
    int8: 1,
    uint16: 2,
    int16: 2,
    uint32: 4,
    int32: 4,
    uint64: 8,
    int64: 8,
    float: 4
} as const;

export interface IntegerBoundary {
    min: number|bigint;
    max: number|bigint;
}

export const BOUNDS = {
    uint8: {
        min: 0,
        max: 255,
    },
    int8: {
        min: -127,
        max: 127,
    },
    uint16: {
        min: 0,
        max: 65535,
    },
    int16: {
        min: -32767,
        max: 32767,
    },
    uint32: {
        min: 0,
        max: 4294967295,
    },
    int32: {
        min: -2147483647,
        max: 2147483647,
    },
    uint64: {
        min: 0,
        max: 18446744073709552000
    },
    int64: {
        min: -BigInt(9223372036854776000),
        max: BigInt(9223372036854776000)
    }
} as const;
