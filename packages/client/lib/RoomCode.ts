export enum RoomCodeVersion {
    V1,
    V2,
}

export class RoomCode {
    static characters = "QWXRTYLPESDFGHUJKZOCVBINMA";
    static indexes = [ 25, 21, 19, 10, 8, 11, 12, 13, 22, 15, 16, 6, 24, 23, 18, 7, 0, 3, 9, 4, 14, 20, 1, 2, 5, 17];

    static nil = new RoomCode(0);

    private static fromV2Parts(a: number, b: number, c: number, d: number, e: number, f: number): RoomCode {
        const one = (a + 26 * b) & 0x3ff;
        const two = c + 26 * (d + 26 * (e + 26 * f));

        return new RoomCode(one | ((two << 10) & 0x3ffffc00) | 0x80000000);
    }

    static fromString(str: string): RoomCode {
        if (str.length === 6) {
            const a = RoomCode.indexes[str.charCodeAt(0) - 65];
            const b = RoomCode.indexes[str.charCodeAt(1) - 65];
            const c = RoomCode.indexes[str.charCodeAt(2) - 65];
            const d = RoomCode.indexes[str.charCodeAt(3) - 65];
            const e = RoomCode.indexes[str.charCodeAt(4) - 65];
            const f = RoomCode.indexes[str.charCodeAt(5) - 65];

            return RoomCode.fromV2Parts(a, b, c, d, e, f);
        } else if (str.length === 4) {
            const a = str.charCodeAt(0) & 0xff;
            const b = str.charCodeAt(1) & 0xff;
            const c = str.charCodeAt(2) & 0xff;
            const d = str.charCodeAt(3) & 0xff;

            return new RoomCode(a | (b << 8) | (c << 16) | (d << 24));
        } else {
            throw new Error("Invalid room code, expected '4' or '6' characters long, got string with " + str.length + " characters.");
        }
    }

    static generateRandom(version: RoomCodeVersion): RoomCode {
        switch (version) {
            case RoomCodeVersion.V1:
                const a = ~~(Math.random() * 26) + 65;
                const b = ~~(Math.random() * 26) + 65;
                const c = ~~(Math.random() * 26) + 65;
                const d = ~~(Math.random() * 26) + 65;

                return new RoomCode(a | (b << 8) | (c << 16) | (d << 24));
            case RoomCodeVersion.V2:
                return RoomCode.fromV2Parts(
                    ~~(Math.random() * 26),
                    ~~(Math.random() * 26),
                    ~~(Math.random() * 26),
                    ~~(Math.random() * 26),
                    ~~(Math.random() * 26),
                    ~~(Math.random() * 26)
                );
        }
    }

    constructor(public readonly id: number) {}

    get version() {
        return this.id < 0 ? RoomCodeVersion.V2 : RoomCodeVersion.V1;
    }

    get isNil() {
        return this.id === 0;
    }

    toString(): string {
        switch (this.version) {
            case RoomCodeVersion.V1:
                return String.fromCharCode(this.id & 0xff, (this.id >> 8) & 0xff, (this.id >> 16) & 0xff, (this.id >> 24) & 0xff);
            case RoomCodeVersion.V2:
                const a = this.id & 0x3ff;
                const b = (this.id >> 10) & 0xfffff;

                return RoomCode.characters[a % 26] +
                    RoomCode.characters[~~(a / 26)] +
                    RoomCode.characters[b % 26] +
                    RoomCode.characters[~~((b / 26) % 26)] +
                    RoomCode.characters[~~((b / (26 * 26)) % 26)] +
                    RoomCode.characters[~~((b / (26 * 26 * 26)) % 26)];
        }
    }
}