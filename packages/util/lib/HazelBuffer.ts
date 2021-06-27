import { IntegerBoundary } from "./bounds";

export class HazelBuffer {
    protected _cursor: number;

    protected constructor(protected _buffer: Buffer) {
        this._cursor = 0;
    }

    protected static checkInteger(val: number, bounds?: IntegerBoundary) {
        if (typeof val !== "number") {
            throw new TypeError(
                "Expected an integer, instead got " + typeof val + "."
            );
        }

        if (!Number.isInteger(val)) {
            throw new TypeError("Expected an integer, instead got a fraction.");
        }

        if (bounds) {
            if (val < bounds.min || val > bounds.max) {
                throw new RangeError(
                    "Expected value to be within " +
                        bounds.min +
                        " and " +
                        bounds.max +
                        ", got " +
                        val +
                        "."
                );
            }
        }
    }

    /**
     * The buffer that the writer or reader is targeting.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(6);
     *
     * console.log(writer; // => <HazelBuffer [00] 00 00 00 00 00>
     * ```
     */
    get buffer() {
        return this._buffer;
    }

    /**
     * The size of the buffer that the writer or reader is targeting.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(6);
     *
     * console.log(writer.size); // => 6
     * ```
     */
    get size() {
        return this._buffer.byteLength;
    }

    /**
     * The current position of the writer or reader.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(2);
     * writer.uint16(4);
     *
     * console.log(writer.cursor); // => 2
     * ```
     */
    get cursor() {
        return this._cursor;
    }

    /**
     * The number of bytes left in the writer or reader.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(6);
     * writer.uint16(4);
     *
     * console.log(writer.left); // => 4
     * ```
     */
    get left() {
        return Math.max(this.size - this._cursor, 0);
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.buffer.byteLength; i++) {
            yield this.buffer[i];
        }
    }

    toString(encoding: BufferEncoding = "hex") {
        return this.buffer.toString(encoding);
    }

    [Symbol.for("nodejs.util.inspect.custom")]() {
        const width = 10;

        let min = this.cursor - Math.floor(width / 2);
        let max = this.cursor + Math.ceil(width / 2);

        if (max >= this.buffer.byteLength) {
            min = Math.max(0, this.buffer.byteLength - width);
            max = this.buffer.byteLength;
        }
        if (min < 0) {
            max = Math.min(this.buffer.byteLength - 1, max + (0 - min));
            min = 0;
        }

        const view = [...this.buffer]
            .slice(min, max)
            .map((_) => _.toString(16).padStart(2, "0"));
        const cur_view = this.cursor - min;
        if (min > 0) {
            view.unshift(".." + min + " byte" + (min === 1 ? "" : "s") + "..");
        }
        if (max < this.buffer.byteLength) {
            const num = this.buffer.byteLength - max;
            view.push(".." + num + " byte" + (num === 1 ? "" : "s") + "..");
        }
        if (cur_view < 0) {
            const num = 0 - cur_view;
            if (num > 0) {
                view.unshift(
                    ".." + num + " byte" + (num === 1 ? "" : "s") + ".."
                );
            }
            view.unshift("[  ]");
        } else if (cur_view > view.length - 1) {
            const num = cur_view - view.length;
            if (num > 0) {
                view.push(".." + num + " byte" + (num === 1 ? "" : "s") + "..");
            }
            view.push("[  ]");
        } else {
            view[cur_view] = "[" + view[cur_view] + "]";
        }
        return "<HazelBuffer " + view.join(" ") + ">";
    }

    /**
     * Move the cursor to a position.
     * @param pos The position to move to.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(12);
     * writer.goto(5);
     *
     * console.log(writer.cursor); // => 5
     * ```
     */
    goto(pos: number) {
        HazelBuffer.checkInteger(pos);

        this._cursor = pos;
        return this;
    }

    /**
     * Skip a speciied number of bytes.
     * @param pos The number of bytes to skip to.
     * @returns The writer.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(12);
     * writer.skip(3);
     * writer.skip(2);
     * writer.skip(5);
     *
     * console.log(writer.cursor); // => 10
     * ```
     */
    jump(bytes: number) {
        HazelBuffer.checkInteger(bytes);

        this._cursor += bytes;
        return this;
    }

    /**
     * Check whether two hazel buffers contain the same information.
     * @param other The other hazel writer to check.
     * @returns Whether or not the hazel writers are the same.
     * @example
     * ```typescript
     * const writer = HazelWriter.alloc(2);
     * writer.uint8(21);
     * writer.uint8(69);
     *
     * const writer2 = HazelWriter.alloc(2);
     * writer.uint8(21);
     * writer.uint8(69);
     *
     * console.log(writer.compare(writer2)); // => true
     *
     * writer2.uint8(90);
     *
     * console.log(writer.compare(writer2)); // => false
     * ```
     */
    compare(other: HazelBuffer) {
        if (this.buffer.byteLength !== other.buffer.byteLength) {
            return false;
        }

        for (let i = 0; i < this.buffer.byteLength; i++) {
            if (this.buffer[i] !== other.buffer[i]) {
                return false;
            }
        }

        return true;
    }
}
