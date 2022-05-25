const V2MapToChar = "QWXRTYLPESDFGHUJKZOCVBINMA";
const V2MapToInt = [
    25,
    21,
    19,
    10,
    8,
    11,
    12,
    13,
    22,
    15,
    16,
    6,
    24,
    23,
    18,
    7,
    0,
    3,
    9,
    4,
    14,
    20,
    1,
    2,
    5,
    17,
];

/**
 * Static utilities to use to generate game codes and convert between formats.
 */
export class GameCode {
    private constructor() {}

    /**
     * Convert a version 1 game code from a string representation to use as an integer.
     * @param code A version 1 game code as a string, i.e. a 4 letter code.
     * @returns An integer representation of the game code.
     */
    static convertV1StringToInt(code: string) {
        const a = code.charCodeAt(0) & 0xff;
        const b = code.charCodeAt(1) & 0xff;
        const c = code.charCodeAt(2) & 0xff;
        const d = code.charCodeAt(3) & 0xff;

        return a | (b << 8) | (c << 16) | (d << 24);
    }

    /**
     * Generate a random version 1 game code.
     * @returns An integer representation of the generated game code
     */
    static generateV1() {
        const a = ~~(Math.random() * 26) + 65;
        const b = ~~(Math.random() * 26) + 65;
        const c = ~~(Math.random() * 26) + 65;
        const d = ~~(Math.random() * 26) + 65;

        return a | (b << 8) | (c << 16) | (d << 24);
    }

    /**
     * Convert a version 1 game code from an integer representation to use as a string.
     * @param code A version 1 game code as an integer, i.e. a number greater than 0.
     * @returns A string representation of the game code.
     */
    static convertV1IntToString(bytes: number) {
        const a = String.fromCharCode(bytes & 0xff);
        const b = String.fromCharCode((bytes >> 8) & 0xff);
        const c = String.fromCharCode((bytes >> 16) & 0xff);
        const d = String.fromCharCode((bytes >> 24) & 0xff);

        return a + b + c + d;
    }

    static V2Parts2Int(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number
    ) {
        const one = (a + 26 * b) & 0x3ff;
        const two = c + 26 * (d + 26 * (e + 26 * f));

        return one | ((two << 10) & 0x3ffffc00) | 0x80000000;
    }

    /**
     * Convert a version 2 game code from a string representation to use as an integer.
     * @param code A version 2 game code as a string, i.e. a 6 letter code.
     * @returns An integer representation of the game code.
     */
    static convertV2StringToInt(code: string) {
        return this.V2Parts2Int(
            V2MapToInt[code.charCodeAt(0) - 65],
            V2MapToInt[code.charCodeAt(1) - 65],
            V2MapToInt[code.charCodeAt(2) - 65],
            V2MapToInt[code.charCodeAt(3) - 65],
            V2MapToInt[code.charCodeAt(4) - 65],
            V2MapToInt[code.charCodeAt(5) - 65]
        );
    }

    /**
     * Convert a version 2 game code from an integer representation to use as a string.
     * @param code A version 2 game code as an integer, i.e. a number less than 0.
     * @returns A string representation of the game code.
     */
    static convertV2IntToString(bytes: number) {
        const a = bytes & 0x3ff;
        const b = (bytes >> 10) & 0xfffff;

        return (
            V2MapToChar[a % 26] +
            V2MapToChar[~~(a / 26)] +
            V2MapToChar[b % 26] +
            V2MapToChar[~~((b / 26) % 26)] +
            V2MapToChar[~~((b / (26 * 26)) % 26)] +
            V2MapToChar[~~((b / (26 * 26 * 26)) % 26)]
        );
    }

    /**
     * Generate a random version 2 game code.
     * @returns An integer representation of the generated game code
     */
    static generateV2() {
        return this.V2Parts2Int(
            ~~(Math.random() * 26),
            ~~(Math.random() * 26),
            ~~(Math.random() * 26),
            ~~(Math.random() * 26),
            ~~(Math.random() * 26),
            ~~(Math.random() * 26)
        );
    }

    /**
     * Convert a game code from a string representation to use as an integer.
     * @param code A game code as a string.
     * @returns An integer representation of the game code.
     */
    static convertStringToInt(code: string): number {
        if (code.length === 6) {
            return this.convertV2StringToInt(code);
        } else if (code.length === 4) {
            return this.convertV1StringToInt(code);
        } else {
            return 0;
        }
    }

    /**
     * Convert a game code from an integer representation to use as a string.
     * @param code A game code as an integer.
     * @returns A string representation of the game code.
     */
    static convertIntToString(bytes: number) {
        if (bytes < 0) {
            return this.convertV2IntToString(bytes);
        } else {
            return this.convertV1IntToString(bytes);
        }
    }
}
