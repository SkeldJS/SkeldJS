type endian = "le" | "be";

export class HazelBuffer {
    static alloc(size: number, encoding: BufferEncoding = "utf8") {
        return new HazelBuffer(Buffer.alloc(Math.max(0, size), null, encoding));
    }

    static from(buf: any, encoding: BufferEncoding = "hex") {
        return new HazelBuffer(Buffer.from(buf, encoding));
    }

    private messageStack: number[];

    cursor: number;

    constructor(public buffer: Buffer) {
        this.messageStack = [];
        this.cursor = 0;
    }

    [Symbol.iterator]() {
        let cursor = 0;

        return {
            next: () => {
                return {
                    value: this.buffer[cursor],
                    done: cursor++ >= this.size - 1,
                };
            },
        };
    }

    get size() {
        return this.buffer.byteLength;
    }

    get left() {
        return this.size - this.cursor;
    }

    toString(encoding: BufferEncoding = "hex") {
        return this.buffer.toString(encoding);
    }

    goto(pos: number) {
        this.cursor = pos;

        return this;
    }

    jump(bytes: number) {
        this.cursor += bytes;

        return this;
    }

    realloc(size: number) {
        if (size === this.size) {
            return this;
        }

        const newbuf = Buffer.alloc(size);
        const copysz = Math.max(newbuf.byteLength, this.size);

        this.buffer.copy(newbuf, 0, 0, copysz);

        this.buffer = newbuf;

        return this;
    }

    expand(bytes: number) {
        if (this.cursor + bytes > this.size) {
            this.realloc(this.cursor + bytes);
        }

        return this;
    }

    at(position: number) {
        return this.buffer[position];
    }

    uint8(): number;
    uint8(val: number): this;
    uint8(val?: any): any {
        if (typeof val === "number") {
            this.expand(1);
            this.buffer.writeUInt8(val < 0 ? val >>> 0 : val, this.cursor);
            this.cursor += 1;

            return this;
        } else {
            const val = this.buffer.readUInt8(this.cursor);
            this.cursor += 1;

            return val;
        }
    }

    int8(): number;
    int8(val: number): this;
    int8(val?: any): any {
        if (typeof val === "number") {
            this.expand(1);
            this.buffer.writeInt8(val, this.cursor);
            this.cursor += 1;

            return this;
        } else {
            const val = this.buffer.readInt8(this.cursor);
            this.cursor += 1;

            return val;
        }
    }

    byte(): number;
    byte(val: number): this;
    byte(val?: any): any {
        return this.uint8(val);
    }

    char(): string;
    char(val: string): this;
    char(val?: any): any {
        if (typeof val === "string") {
            return this.uint8(val.charCodeAt(0));
        } else {
            return String.fromCharCode(this.uint8());
        }
    }

    bool(): boolean;
    bool(val: boolean): this;
    bool(val?: any): any {
        if (typeof val === "boolean") {
            return this.uint8(val ? 0x01 : 0x00);
        } else {
            return this.uint8() === 0x01;
        }
    }

    uint16LE(): number;
    uint16LE(val: number): this;
    uint16LE(val?: any): any {
        if (typeof val === "number") {
            this.expand(2);
            this.buffer.writeUInt16LE(val < 0 ? val >>> 0 : val, this.cursor);
            this.cursor += 2;

            return this;
        } else {
            const val = this.buffer.readUInt16LE(this.cursor);
            this.cursor += 2;

            return val;
        }
    }

    uint16BE(): number;
    uint16BE(val: number): this;
    uint16BE(val?: any): any {
        if (typeof val === "number") {
            this.expand(2);
            this.buffer.writeUInt16BE(val < 0 ? val >>> 0 : val, this.cursor);
            this.cursor += 2;

            return this;
        } else {
            const val = this.buffer.readUInt16BE(this.cursor);
            this.cursor += 2;

            return val;
        }
    }

    uint16(endian?: endian): number;
    uint16(val: number, endian?: endian): this;
    uint16(val?: any, endian: endian = "le"): any {
        return endian === "be" || val === "be"
            ? this.uint16BE(val)
            : this.uint16LE(val);
    }

    int16LE(): number;
    int16LE(val: number): this;
    int16LE(val?: any): any {
        if (typeof val === "number") {
            this.expand(2);
            this.buffer.writeInt16LE(val, this.cursor);
            this.cursor += 2;

            return this;
        } else {
            const val = this.buffer.readInt16LE(this.cursor);
            this.cursor += 2;

            return val;
        }
    }

    int16BE(): number;
    int16BE(val: number): this;
    int16BE(val?: any): any {
        if (typeof val === "number") {
            this.expand(2);
            this.buffer.writeInt16BE(val, this.cursor);
            this.cursor += 2;

            return this;
        } else {
            const val = this.buffer.readInt16BE(this.cursor);
            this.cursor += 2;

            return val;
        }
    }

    int16(endian?: endian): number;
    int16(val: number, endian?: endian): this;
    int16(val?: any, endian: endian = "le"): any {
        return endian === "be" || val === "be"
            ? this.int16BE(val)
            : this.int16LE(val);
    }

    uint32LE(): number;
    uint32LE(val: number): this;
    uint32LE(val?: any): any {
        if (typeof val === "number") {
            this.expand(4);
            this.buffer.writeUInt32LE(val < 0 ? val >>> 0 : val, this.cursor);
            this.cursor += 4;

            return this;
        } else {
            const val = this.buffer.readUInt32LE(this.cursor);
            this.cursor += 4;

            return val;
        }
    }

    uint32BE(): number;
    uint32BE(val: number): this;
    uint32BE(val?: any): any {
        if (typeof val === "number") {
            this.expand(4);
            this.buffer.writeUInt32BE(val < 0 ? val >>> 0 : val, this.cursor);
            this.cursor += 4;

            return this;
        } else {
            const val = this.buffer.readUInt32BE(this.cursor);
            this.cursor += 4;

            return val;
        }
    }

    uint32(endian?: endian): number;
    uint32(val: number, endian?: endian): this;
    uint32(val?: any, endian: endian = "le"): any {
        return endian === "be" || val === "be"
            ? this.uint32BE(val)
            : this.uint32LE(val);
    }

    int32LE(): number;
    int32LE(val: number): this;
    int32LE(val?: any): any {
        if (typeof val === "number") {
            this.expand(4);
            this.buffer.writeInt32LE(val, this.cursor);
            this.cursor += 4;

            return this;
        } else {
            const val = this.buffer.readInt32LE(this.cursor);
            this.cursor += 4;

            return val;
        }
    }

    int32BE(): number;
    int32BE(val: number): this;
    int32BE(val?: any): any {
        if (typeof val === "number") {
            this.expand(4);
            this.buffer.writeInt32BE(val, this.cursor);
            this.cursor += 4;

            return this;
        } else {
            const val = this.buffer.readInt32BE(this.cursor);
            this.cursor += 4;

            return val;
        }
    }

    int32(endian?: endian): number;
    int32(val: number, endian?: endian): this;
    int32(val?: any, endian: endian = "le"): any {
        return endian === "be" || val === "be"
            ? this.int32BE(val)
            : this.int32LE(val);
    }

    floatLE(): number;
    floatLE(val: number): this;
    floatLE(val?: any): any {
        if (typeof val === "number") {
            this.expand(4);
            this.buffer.writeFloatLE(val, this.cursor);
            this.cursor += 4;

            return this;
        } else {
            const val = this.buffer.readFloatLE(this.cursor);
            this.cursor += 4;

            return val;
        }
    }

    floatBE(): number;
    floatBE(val: number): this;
    floatBE(val?: any): any {
        if (typeof val === "number") {
            this.expand(4);
            this.buffer.writeFloatBE(val, this.cursor);
            this.cursor += 4;

            return this;
        } else {
            const val = this.buffer.readFloatBE(this.cursor);
            this.cursor += 4;

            return val;
        }
    }

    float(endian?: endian): number;
    float(val: number, endian?: endian): this;
    float(val?: any, endian: endian = "le"): any {
        return endian === "be" || val === "be"
            ? this.floatBE(val)
            : this.floatLE(val);
    }

    bytes(bytes: number): number[];
    bytes(bytes: number[]): this;
    bytes(bytes: any): any {
        if (Array.isArray(bytes)) {
            this.expand(bytes.length);

            for (let i = 0; i < bytes.length; i++) {
                this.byte(bytes[i]);
            }

            return this;
        } else {
            const val: number[] = [];

            for (let i = 0; i < bytes; i++) {
                val.push(this.byte());
            }

            return val;
        }
    }

    buf(buff: HazelBuffer | Buffer): HazelBuffer;
    buf(buff: number): HazelBuffer;
    buf(buff: any): any {
        if (typeof buff !== "number") {
            const buffer = Buffer.isBuffer(buff) ? buff : buff.buffer;
            this.bytes([...buffer]);

            return this;
        } else {
            const buf = new HazelBuffer(
                this.buffer.slice(this.cursor, this.cursor + buff)
            );
            this.cursor += buff;

            return buf;
        }
    }

    string(): string;
    string(str: string, encoding?: BufferEncoding): this;
    string(str?: any, encoding?: any): any {
        if (typeof str === "string") {
            this.upacked(str.length);
            this.expand(str.length);

            this.buffer.write(str, this.cursor, encoding || "utf8");
            this.cursor += str.length;

            return this;
        } else {
            const length = this.upacked();
            let str = "";

            for (let i = 0; i < length; i++) {
                str += this.char();
            }

            return str;
        }
    }

    packed(): number;
    packed(val: number): this;
    packed(val?: any): any {
        if (typeof val === "number") {
            this.expand(Math.ceil(val.toString(2).length / 7));

            do {
                let b = val & 0xff;

                if (val >= 0x80) {
                    b |= 0x80;
                }

                this.uint8(b);

                val >>= 7;
            } while (val > 0);

            return this;
        } else {
            let out = 0;

            for (let shift = 0; ; shift++) {
                const byte = this.uint8();

                const read = (byte >> 7) & 1;
                const val = read ? byte ^ 0x80 : byte;

                if (val) {
                    out |= val << (shift * 7);
                } else if (read) {
                    out <<= shift * 7;
                }

                if (!read) {
                    break;
                }
            }

            return out;
        }
    }

    upacked(): number;
    upacked(val: number): this;
    upacked(val?: any): any {
        if (typeof val === "number") {
            if (val < 0) return this.upacked(val >>> 0);

            this.expand(Math.ceil(val.toString(16).length / 7));

            do {
                let b = val & 0xff;

                if (val >= 0x80) {
                    b |= 0x80;
                }

                this.uint8(b);

                val >>>= 7;
            } while (val > 0);

            return this;
        } else {
            let out = 0;

            for (let shift = 0; ; shift++) {
                const byte = this.uint8();

                const read = (byte >> 7) & 1;
                const val = read ? byte ^ 0x80 : byte;

                if (val) {
                    out |= val << (shift * 7);
                } else if (read) {
                    out <<= shift * 7;
                }

                if (!read) {
                    break;
                }
            }

            return out >>> 0;
        }
    }

    ip(): string;
    ip(val: string): this;
    ip(val?: any): any {
        if (typeof val === "string") {
            return this.bytes(val.split(".").map((byte) => parseInt(byte)));
        } else {
            return this.bytes(4).join(".");
        }
    }

    message(): [number, HazelBuffer];
    message(tag?: number): this;
    message(tag?: number) {
        if (typeof tag === "undefined") {
            const length = this.uint16();
            const tag = this.uint8();

            return [tag, this.buf(length)];
        }

        this.messageStack.push(this.cursor);

        this.jump(2) // Skip length to be written later.
            .uint8(tag);

        return this;
    }

    end() {
        const lenpos = this.messageStack.pop();
        const curpos = this.cursor;

        return this.goto(lenpos)
            .uint16(curpos - lenpos - 3)
            .goto(curpos);
    }
}
