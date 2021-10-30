import { BOUNDS, SIZES } from "./bounds";
import { HazelBuffer } from "./HazelBuffer";
import { Vector2 } from "./Vector";

type ListWriter<T> = (item: T, i: number, writer: HazelWriter) => any;

type Serializable<T extends any[] = any[]> = {
    PreSerialize?(): void;
    Serialize(writer: HazelWriter, ...args: T): void;
};
type GetSerializeArgs<T extends Serializable> = T extends Serializable<infer K>
    ? K
    : never;

export class HazelWriter extends HazelBuffer {
    /**
     * Allocate a message writer with a buffer of the specified number of bytes.
     * @param bytes The number of bytes to allocate.
     * @returns The message writer writing to the allocated bytes.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(6);
     *
     * console.log(writer.size); // => 6
     * ```
     */
    static alloc(bytes: number) {
        HazelBuffer.checkInteger(bytes, BOUNDS.uint32);
        const buffer = Buffer.alloc(bytes);

        return new HazelWriter(buffer);
    }

    private messageStack: number[];

    private constructor(_buffer: Buffer) {
        super(_buffer);

        this.messageStack = [];
    }

    /**
     * Clone the message writer to a new writer with a separate buffer.
     * @returns The new message writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(2);
     * writer.uint8(32);
     * writer.uint8(12);
     *
     * const cloned = writer.clone();
     * cloned.uint8(90);
     *
     * console.log(writer); // => <HazelBuffer 20 0c [  ]>
     * console.log(cloned); // => <HazelBuffer 20 0c 5a [  ]>
     * ```
     */
    clone() {
        const writer = HazelWriter.alloc(this.size);
        this.buffer.copy(writer.buffer);
        writer.goto(this._cursor);

        return writer;
    }

    /**
     * Reallocate the the number of bytes in the writer.
     * @param size The size to reallocate to.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     * writer.realloc(8);
     *
     * console.log(writer.size); // => 8
     * ```
     */
    realloc(size: number) {
        HazelBuffer.checkInteger(size);

        if (size === this.size) {
            return this;
        }

        const new_buffer = Buffer.alloc(size);
        this._buffer.copy(new_buffer);
        this._buffer = new_buffer;

        return this;
    }

    /**
     * Expand the writer by the number of bytes required to write a value. Won't reallocate if there are enough bytes remaining.
     * @param required The number of bytes required to write a value.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(6);
     * writer.expand(2); // The cursor is at 0, since there is 2 bytes remaining, the size remains at 6.
     *
     * console.log(writer.size); // => 6
     *
     * writer.expand(8); // There is not 8 bytes remaining so the writer buffer is reallocated to 8.
     * console.log(writer.size); // => 8
     * ```
     */
    expand(required: number) {
        HazelBuffer.checkInteger(required);

        if (required < 0) {
            throw new RangeError("Cannot expand by a negative amount.");
        }

        if (this._cursor + required >= this.size) {
            this.realloc(this._cursor + required);
        }

        return this;
    }

    /**
     * Write an unsigned 8-bit integer value.
     * @param val The value to write. (Between 0 and 255 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(1);
     *
     * writer.uint8(54);
     * ```
     */
    uint8(val: number) {
        HazelBuffer.checkInteger(val, BOUNDS.uint8);

        this.expand(SIZES.uint8);
        this.buffer.writeUInt8(val, this._cursor);
        this._cursor += SIZES.uint8;

        return this;
    }

    /**
     * Write a signed 8-bit integer value.
     * @param val The value to write. (Between -127 and 127 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     *
     * writer.int8(-120);
     * writer.int8(68);
     * ```
     */
    int8(val: number) {
        HazelBuffer.checkInteger(val, BOUNDS.int8);

        this.expand(SIZES.uint8);
        this.buffer.writeInt8(val, this._cursor);
        this._cursor += SIZES.uint8;

        return this;
    }

    /**
     * Write a single unsigned byte.
     * @param val The value to write. (Between 0 and 255 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(1);
     *
     * writer.byte(69);
     * ```
     */
    byte(val: number) {
        return this.uint8(val);
    }

    /**
     * Write a single signed byte.
     * @param val The value to write. (Between -127 and 127 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(1);
     *
     * writer.byte(-32);
     * ```
     */
    sbyte(val: number) {
        return this.int8(val);
    }

    /**
     * Write a single utf8 char.
     * @param val The value to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     *
     * writer.char("A");
     * writer.char("6");
     * ```
     */
    char(val: string) {
        if (val.length !== 1) {
            throw new Error("Expected a single character, got '" + val + "'.");
        }

        this.uint8(val.charCodeAt(0));
    }

    /**
     * Write a true or false value.
     * @param val The value to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     *
     * writer.bool(true);
     * writer.bool(false);
     * ```
     */
    bool(val: boolean) {
        this.uint8(val ? 1 : 0);
        return this;
    }

    /**
     * Write a serializable object to the writer.
     * @param serializable The object to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(0);
     *
     * writer.write(player.control);
     * ```
     */
    write<K extends Serializable>(
        serializable: K,
        ...args: GetSerializeArgs<K>
    ) {
        if (serializable.PreSerialize) {
            serializable.PreSerialize();
        }

        serializable.Serialize(this, ...args);
        return this;
    }

    /**
     * Write a list of serializable objects to the writer.
     * @param serializable The objects to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(0);
     *
     * writer.write(players.map(player => player.control));
     * ```
     */
    lwrite<K extends Serializable>(
        length: boolean,
        serializable: K[],
        ...args: GetSerializeArgs<K>
    ) {
        if (length) {
            this.upacked(serializable.length);
        }

        for (const object of serializable) {
            this.write(object, ...args);
        }
        return this;
    }

    /**
     * Write an unsigned 16-bit integer value.
     * @param val The value to write. (Between 0 and 65535 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     *
     * writer.uint16(5342);
     * writer.uint16(256);
     * ```
     */
    uint16(val: number, be = false) {
        HazelBuffer.checkInteger(val, BOUNDS.uint16);

        this.expand(SIZES.uint16);
        if (be) {
            this.buffer.writeUInt16BE(val, this._cursor);
        } else {
            this.buffer.writeUInt16LE(val, this._cursor);
        }
        this._cursor += SIZES.uint16;

        return this;
    }

    /**
     * Write a signed 16-bit integer value.
     * @param val The value to write. (Between -32767 and 32767 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     *
     * writer.int16(-3452);
     * writer.int16(1933);
     * ```
     */
    int16(val: number, be = false) {
        HazelBuffer.checkInteger(val, BOUNDS.int16);

        this.expand(SIZES.int16);
        if (be) {
            this.buffer.writeInt16BE(val, this._cursor);
        } else {
            this.buffer.writeInt16LE(val, this._cursor);
        }
        this._cursor += SIZES.int16;

        return this;
    }

    /**
     * Write an unsigned 32-bit integer value.
     * @param val The value to write. (Between 0 and 4294967295 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(8);
     *
     * writer.uint32(6764774);
     * writer.uint32(12314352);
     * ```
     */
    uint32(val: number, be = false) {
        HazelBuffer.checkInteger(val, BOUNDS.uint32);

        this.expand(SIZES.uint32);
        if (be) {
            this.buffer.writeUInt32BE(val, this._cursor);
        } else {
            this.buffer.writeUInt32LE(val, this._cursor);
        }
        this._cursor += SIZES.uint32;

        return this;
    }

    /**
     * Write a signed 32-bit integer value.
     * @param val The value to write. (Between -2147483647 and 2147483647 inclusive.)
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(8);
     *
     * writer.uint32(-432423);
     * writer.uint32(1212112);
     * ```
     */
    int32(val: number, be = false) {
        HazelBuffer.checkInteger(val, BOUNDS.int32);

        this.expand(SIZES.int32);
        if (be) {
            this.buffer.writeInt32BE(val, this._cursor);
        } else {
            this.buffer.writeInt32LE(val, this._cursor);
        }
        this._cursor += SIZES.int32;

        return this;
    }

    /**
     * Write an IEEE 754 floating point number.
     * @param val The value to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(8);
     *
     * writer.float(54.32);
     * writer.float(21.69420);
     * ```
     */
    float(val: number, be = false) {
        if (typeof val !== "number") {
            throw new TypeError("Expected a number, got " + typeof val + ".");
        }

        this.expand(SIZES.float);
        if (be) {
            this.buffer.writeFloatBE(val, this._cursor);
        } else {
            this.buffer.writeFloatLE(val, this._cursor);
        }
        this._cursor += SIZES.float;

        return this;
    }

    /**
     * Write a signed variable-sized integer.
     * @param val The value to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(0);
     *
     * writer.packed(-420);
     * writer.packed(153);
     * ```
     */
    packed(val: number) {
        HazelBuffer.checkInteger(val, BOUNDS.int32);

        return this.upacked(val >>> 0);
    }

    /**
     * Write an unsigned variable-size integer.
     * @param val The value to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(0);
     *
     * writer.packed(54325);
     * writer.packed(11293);
     * ```
     */
    upacked(val: number) {
        HazelBuffer.checkInteger(val, BOUNDS.uint32);

        do {
            let byte = val & 0xff;

            if (val >= 0x80) {
                byte |= 0x80;
            }

            this.uint8(byte);

            val >>>= 7;
        } while (val > 0);
    }

    /**
     * Write a packed int length-prefixed string.
     * @param val The string to write.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(9);
     *
     * writer.string("poopy");
     * writer.string("poop");
     * ``
     */
    string(val: string) {
        this.upacked(val.length);
        this.bytes(val);
    }

    /**
     * Write non-length-prefixed bytes.
     * @param bytes The bytes to write to the buffer.
     * @returns The writer.
     * ```typescript
     * const writer = HazelWriter.alloc(5);
     * writer.bytes("Hello");
     * ```
     */
    bytes(bytes: string | number[] | Buffer | HazelBuffer): this {
        if (Buffer.isBuffer(bytes)) {
            this.expand(bytes.byteLength);
            bytes.copy(this.buffer, this._cursor);
            this._cursor += bytes.byteLength;
            return this;
        }

        if (Array.isArray(bytes) || typeof bytes === "string") {
            const buffer = Buffer.from(bytes);
            return this.bytes(buffer);
        }

        return this.bytes(bytes.buffer);
    }

    /**
     * Begin writing a new length & tag message.
     * @param tag The tag of the message.
     * @returns The writer.
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     * writer.begin(5);
     * writer.uint8(0x45);
     * writer.end();
     * ```
     */
    begin(tag: number) {
        this.messageStack.push(this._cursor);
        this.jump(2);
        this.uint8(tag);
        return this;
    }

    /**
     * End writing an opened message.
     * @returns The writer.
     * ```typescript
     * const writer = HazelWriter.alloc(4);
     * writer.begin(5);
     * writer.uint8(0x45);
     * writer.end();
     * ```
     */
    end() {
        const pos = this.messageStack.pop();

        if (typeof pos !== "number") {
            throw new Error("Attempted to end a message that never started.");
        }

        const length = this._cursor - pos;

        if (length > BOUNDS.uint16.max) {
            throw new Error("Message length of " + length + " was too long.");
        }

        const cursor = this._cursor;
        this.goto(pos);
        this.uint16(length - 3);
        this.goto(cursor);
        return this;
    }

    /**
     * Write an object list from the buffer.
     * @param length The length of the list.
     * @param fn The function accepting a single reader to use for reading data.
     * @returns The writer.
     * @example
     * ```typescript
     * const nums = [5, 6, 7, 8];
     * const reader = HazelReader.alloc(0);
     *
     * const items = reader.list(nums, (item, writer) => writer.uint8(item));
     *
     * console.log(items); // => [5, 6, 7, 8];
     * ```
     */
    list<T>(length: boolean, arr: T[], fn?: ListWriter<T>) {
        if (length) {
            this.upacked(arr.length);
        }

        for (let i = 0; i < arr.length; i++) {
            const obj = arr[i];
            if (fn) fn(obj, i, this);
        }

        return this;
    }

    /**
     * Write a vector position into 2 16 bit integers.
     * @param position The position to write.
     * @returns The writer.
     */
    vector(position: Vector2) {
        const x = Vector2.unlerp(position.x) * 65535;
        const y = Vector2.unlerp(position.y) * 65535;

        this.uint16(~~x);
        this.uint16(~~y);
    }
}
