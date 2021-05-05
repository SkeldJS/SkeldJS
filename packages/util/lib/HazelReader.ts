import { SIZES } from "./bounds";
import { HazelBuffer } from "./HazelBuffer";
import { Vector2 } from "./Vector";

type ListReader<T> = (reader: HazelReader, i: number) => T;

type Deserializable<T extends any[] = any[]> = {
    Deserialize(reader: HazelReader, ...args: T): any;
};
type GetSerializable<T extends Deserializable> = T extends {
    Deserialize(reader: HazelReader, ...args: any[]): infer X;
}
    ? X
    : never;
type GetDeserializeArgs<T extends Deserializable> = T extends Deserializable<
    infer K
>
    ? K
    : never;

export class HazelReader extends HazelBuffer {
    /**
     * Create a hazel reader from a buffer.
     * @param buffer The buffer to read from.
     * @returns The created reader.
     * @example
     * ```typescript
     * const buffer = Buffer.alloc(2);
     * buffer.writeUInt16(53, 0);
     *
     * const reader = HazelReader.from(buffer);
     * ```
     */
    static from(buffer: Buffer): HazelReader;

    /**
     * Create a hazel reader from a string.
     * @param str The string to read from.
     * @returns The created reader.
     * @example
     * ```typescript
     * const reader = HazelReader.from("weakeyes", "utf8");
     * ```
     */
    static from(str: string, encoding: BufferEncoding): HazelReader;

    /**
     * Create a hazel reader from a number array.
     * @param bytes The byte array to read from.
     * @returns The created reader.
     * @example
     * ```typescript
     * const reader = HazelReader.from([5, 6, 7, 8]);
     * ```
     */
    static from(bytes: number[], encoding: BufferEncoding): HazelReader;
    static from(
        bytes: string | number[] | Buffer,
        encoding: BufferEncoding = "utf8"
    ) {
        if (typeof bytes === "string") {
            const buffer = Buffer.from(bytes, encoding);
            return new HazelReader(buffer);
        }

        if (Array.isArray(bytes)) {
            const buffer = Buffer.from(bytes);
            return new HazelReader(buffer);
        }

        return new HazelReader(bytes);
    }

    private constructor(_buffer: Buffer) {
        super(_buffer);
    }

    /**
     * Read an unsigned 8-bit integer value.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from([5, 6, 7, 8]);
     *
     * console.log(reader.uint8()); // => 5
     * ```
     */
    uint8() {
        const val = this._buffer.readUInt8(this._cursor);
        this._cursor += SIZES.uint8;
        return val;
    }

    /**
     * Read a signed 8-bit integer value.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from([130, 6, 7, 8]);
     *
     * console.log(reader.int8()); // => -125
     * ```
     */
    int8() {
        const val = this._buffer.readInt8(this._cursor);
        this._cursor += SIZES.int8;
        return val;
    }

    /**
     * Read a single boolean value.
     * @returns The boolean that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("0001", "hex");
     *
     * console.log(reader.bool()) // => false
     * console.log(reader.bool()) // => true
     * ```
     */
    bool() {
        return this.uint8() === 1;
    }

    /**
     * Read a deserializable object from the reader.
     * @param deserializable The object class to read.
     * @returns The deserialized data.
     */
    read<K extends Deserializable>(
        deserializable: K,
        ...args: GetDeserializeArgs<K>
    ): GetSerializable<K> {
        return deserializable.Deserialize(this, ...args);
    }

    /**
     * Read a list of deserializable objects from the reader.
     * @param deserializable The object class to read.
     * @returns An array of deserialized objects.
     */
    lread<K extends Deserializable>(
        length: number,
        deserializable: K,
        ...args: GetDeserializeArgs<K>
    ): GetSerializable<K>[] {
        return this.list(length, (reader) =>
            deserializable.Deserialize(reader, ...args)
        );
    }

    /**
     * Read a single ascii character.
     * @returns The character that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("41", "hex");
     *
     * console.log(reader.char()) // => A
     * ```
     */
    char() {
        return String.fromCharCode(this.uint8());
    }

    /**
     * Read a single unsigned byte.
     * @returns The byte that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("41", "hex");
     *
     * console.log(reader.byte()) // => 65
     * ```
     */
    byte() {
        return this.uint8();
    }

    /**
     * Read a single signed byte.
     * @returns The byte that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("41", "hex");
     *
     * console.log(reader.sbyte()) // => 65
     * ```
     */
    sbyte() {
        return this.int8();
    }

    /**
     * Read an unsigned 16-bit integer value.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from([130, 6, 7, 8]);
     *
     * console.log(reader.uint16()); // => 1666
     * ```
     */
    uint16(be = false) {
        const val = be
            ? this._buffer.readUInt16BE(this._cursor)
            : this._buffer.readUInt16LE(this._cursor);
        this._cursor += SIZES.uint16;
        return val;
    }

    /**
     * Read a signed 16-bit integer value.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from([130, 6, 7, 8]);
     *
     * console.log(reader.int16()); // => 1666
     * ```
     */
    int16(be = false) {
        const val = be
            ? this._buffer.readInt16BE(this._cursor)
            : this._buffer.readInt16LE(this._cursor);
        this._cursor += SIZES.int16;
        return val;
    }

    /**
     * Read an unsigned 32-bit integer value.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from([130, 6, 7, 8]);
     *
     * console.log(reader.uint32()); // => 1666
     * ```
     */
    uint32(be = false) {
        const val = be
            ? this._buffer.readUInt32BE(this._cursor)
            : this._buffer.readUInt32LE(this._cursor);
        this._cursor += SIZES.uint32;
        return val;
    }

    /**
     * Read a signed 32-bit integer value.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from([130, 6, 7, 8]);
     *
     * console.log(reader.int32()); // => 1666
     * ```
     */
    int32(be = false) {
        const val = be
            ? this._buffer.readInt32BE(this._cursor)
            : this._buffer.readInt32LE(this._cursor);
        this._cursor += SIZES.int32;
        return val;
    }

    /**
     * Read an IEEE 754 floating point number.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from([130, 6, 7, 8]);
     *
     * console.log(reader.float()); // => 1666
     * ```
     */
    float(be = false) {
        const val = be
            ? this._buffer.readFloatBE(this._cursor)
            : this._buffer.readFloatLE(this._cursor);
        this._cursor += SIZES.float;
        return val;
    }

    /**
     * Read a signed variable-sized integer.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("ac9e04", "hex");
     *
     * console.log(reader.packed()); // => 69420
     * ```
     */
    packed() {
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

    /**
     * Read an unsigned variable-sized integer.
     * @returns The value that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("ac9e04", "hex");
     *
     * console.log(reader.upacked()); // => 69420
     * ```
     */
    upacked() {
        return this.packed() >>> 0;
    }

    /**
     * Read a list of chars.
     * @returns The string that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("48656c6c6f2c20776f726c6421", "hex");
     *
     * console.log(reader.string()); // => Hello, world!
     * ```
     */
    string(): string {
        const length = this.upacked();
        const str = this.buffer
            .slice(this._cursor, this._cursor + length)
            .toString("utf8");

        this._cursor += length;
        return str;
    }

    /**
     * Read a hazel message.
     * @returns The message that was read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("0005010a0a0a0a0a");
     *
     * const [ tag, mreader ] = reader.message();
     *
     * console.log(tag, mreader.size); // => 1 5
     * ```
     */
    message(): [number, HazelReader] {
        const length = this.uint16();
        const tag = this.uint8();
        const message = this.bytes(length);
        return [tag, message];
    }

    /**
     * Read a specified number of bytes.
     * @param bytes The number of bytes to read.
     * @example
     * ```typescript
     * const reader = HazelReader.from("030201);
     *
     * const message = reader.bytes(2);
     *
     * console.log(message.buffer); // => <Buffer 03 02>
     * ```
     */
    bytes(bytes: number) {
        const buffer = this.buffer.slice(this._cursor, this._cursor + bytes);
        this._cursor += bytes;
        return HazelReader.from(buffer);
    }

    /**
     * Read an object list from the buffer.
     * @param length The length of the list.
     * @param fn The function accepting a single reader to use for reading data.
     * @example
     * ```typescript
     * const reader = HazelReader.from([5, 6, 7, 8]);
     *
     * const items = reader.list(reader => reader.uint8());
     *
     * console.log(items); // => [5, 6, 7, 8];
     * ```
     */
    list<T>(length: number, fn: ListReader<T>): T[];
    list<T>(fn: ListReader<T>): T[];
    list<T>(length: ListReader<T> | number, fn?: ListReader<T>) {
        if (typeof length === "number") {
            if (!fn) {
                throw new TypeError(
                    "Expected a function for list reader, instead got " +
                        typeof fn +
                        "."
                );
            }

            const items: T[] = [];
            for (let i = 0; i < length; i++) {
                items.push(fn(this, i));
            }
            return items;
        }

        return this.list(this.upacked(), length);
    }

    /**
     * Read a vector position.
     * @returns The vector that was read.
     */
    vector() {
        const x = this.uint16();
        const y = this.uint16();

        return new Vector2(Vector2.lerp(x / 65535), Vector2.lerp(y / 65535));
    }
}
