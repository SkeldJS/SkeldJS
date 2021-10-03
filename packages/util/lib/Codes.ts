export function V1Code2Int(code: string) {
    const a = code.charCodeAt(0) & 0xff;
    const b = code.charCodeAt(1) & 0xff;
    const c = code.charCodeAt(2) & 0xff;
    const d = code.charCodeAt(3) & 0xff;

    return a | (b << 8) | (c << 16) | (d << 24);
}

export function V1Gen() {
    const a = ~~(Math.random() * 26) + 65;
    const b = ~~(Math.random() * 26) + 65;
    const c = ~~(Math.random() * 26) + 65;
    const d = ~~(Math.random() * 26) + 65;

    return a | (b << 8) | (c << 16) | (d << 24);
}

export function V1Int2Code(bytes: number) {
    const a = String.fromCharCode(bytes & 0xff);
    const b = String.fromCharCode((bytes >> 8) & 0xff);
    const c = String.fromCharCode((bytes >> 16) & 0xff);
    const d = String.fromCharCode((bytes >> 24) & 0xff);

    return a + b + c + d;
}

const V2 = "QWXRTYLPESDFGHUJKZOCVBINMA";
const V2Map = [
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

function V2Parts2Int(
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

export function V2Code2Int(code: string) {
    return V2Parts2Int(
        V2Map[code.charCodeAt(0) - 65],
        V2Map[code.charCodeAt(1) - 65],
        V2Map[code.charCodeAt(2) - 65],
        V2Map[code.charCodeAt(3) - 65],
        V2Map[code.charCodeAt(4) - 65],
        V2Map[code.charCodeAt(5) - 65]
    );
}

export function V2Gen() {
    return V2Parts2Int(
        ~~(Math.random() * 26),
        ~~(Math.random() * 26),
        ~~(Math.random() * 26),
        ~~(Math.random() * 26),
        ~~(Math.random() * 26),
        ~~(Math.random() * 26)
    );
}

export function V2Int2Code(bytes: number) {
    const a = bytes & 0x3ff;
    const b = (bytes >> 10) & 0xfffff;

    return (
        V2[a % 26] +
        V2[~~(a / 26)] +
        V2[b % 26] +
        V2[~~((b / 26) % 26)] +
        V2[~~((b / (26 * 26)) % 26)] +
        V2[~~((b / (26 * 26 * 26)) % 26)]
    );
}

export function Code2Int(code: string) {
    if (code.length === 6) {
        return V2Code2Int(code);
    } else if (code.length === 4) {
        return V1Code2Int(code);
    } else {
        return 0;
    }
}

export function Int2Code(bytes: number) {
    if (bytes < 0) {
        return V2Int2Code(bytes);
    } else {
        return V1Int2Code(bytes);
    }
}
