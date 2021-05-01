import assert from "assert";

import { HazelWriter } from "./HazelWriter";

describe("HazelWriter", () => {
    describe("HazelWriter#alloc", () => {
        it("Should allocate a message writer with a buffer of the specified number of bytes.", () => {
            const writer = HazelWriter.alloc(4);
            const writer2 = HazelWriter.alloc(82);
            const writer3 = HazelWriter.alloc(40);

            assert.strictEqual(writer.size, 4);
            assert.strictEqual(writer2.size, 82);
            assert.strictEqual(writer3.size, 40);

            assert.strictEqual(writer.cursor, 0);
            assert.strictEqual(writer2.cursor, 0);
            assert.strictEqual(writer3.cursor, 0);
        });

        it("Should throw if the input is not an integer.", () => {
            assert.throws(() => {
                HazelWriter.alloc(("invalid" as unknown) as number);
            });

            assert.throws(() => {
                HazelWriter.alloc((true as unknown) as number);
            });

            assert.throws(() => {
                HazelWriter.alloc(({} as unknown) as number);
            });

            assert.throws(() => {
                HazelWriter.alloc(1.5);
            });

            assert.throws(() => {
                HazelWriter.alloc(4.99999);
            });
        });

        it("Should throw if the input is negative", () => {
            assert.throws(() => {
                HazelWriter.alloc(-5);
            });

            assert.throws(() => {
                HazelWriter.alloc(-32);
            });

            assert.throws(() => {
                HazelWriter.alloc(-92);
            });
        });
    });

    describe("HazelWriter#clone", () => {
        it("Should clone the writer pointing to a new place in memory.", () => {
            const writer = HazelWriter.alloc(4);
            writer.uint8(4);

            const cloned = writer.clone();

            assert.notStrictEqual(writer.buffer, cloned.buffer);
            assert.deepStrictEqual(writer.buffer.buffer, cloned.buffer.buffer);
            assert.strictEqual(writer.cursor, cloned.cursor);
        });
    });

    describe("HazelWriter#buffer", () => {
        it("Should retrieve the buffer that the writer is writing to.", () => {
            const writer = HazelWriter.alloc(4);
            const writer2 = HazelWriter.alloc(9);

            assert.ok(Buffer.isBuffer(writer.buffer));
            assert.strictEqual(writer.buffer.byteLength, 4);

            assert.ok(Buffer.isBuffer(writer2.buffer));
            assert.strictEqual(writer2.buffer.byteLength, 9);
        });
    });

    describe("HazelWriter#size", () => {
        it("Should retrieve the size of the buffer that the writer is writing to.", () => {
            const writer = HazelWriter.alloc(4);
            const writer2 = HazelWriter.alloc(1);
            const writer3 = HazelWriter.alloc(8);

            assert.strictEqual(writer.size, 4);
            assert.strictEqual(writer2.size, 1);
            assert.strictEqual(writer3.size, 8);
        });
    });

    describe("HazelWriter#cursor", () => {
        it("Should retrieve the current position of the cursor in the writer.", () => {
            const writer = HazelWriter.alloc(0);
            writer.uint8(5);
            assert.strictEqual(writer.size, 1);

            writer.uint8(6);
            assert.strictEqual(writer.size, 2);
        });
    });

    describe("HazelWriter#toString", () => {
        it("Should convert the hazel writer to a hex string.", () => {
            const writer = HazelWriter.alloc(2);
            writer.buffer[0] = 0x41;
            writer.buffer[1] = 0x45;

            assert.strictEqual(writer.toString(), "4145");
        });

        it("Should convert the hazel writer to a string with a given encoding.", () => {
            const writer = HazelWriter.alloc(2);
            writer.buffer[0] = 0x44;
            writer.buffer[1] = 0x4a;

            assert.strictEqual(writer.toString("utf8"), "DJ");
            assert.strictEqual(writer.toString("base64"), "REo=");
        });
    });

    describe("HazelWriter#[Symbol.iterator]", () => {
        it("Should iterate through the buffer, starting from 0.", () => {
            const writer = HazelWriter.alloc(2);
            writer.uint8(69);
            writer.uint8(6);
            writer.uint8(9);

            assert.deepStrictEqual([...writer], [69, 6, 9]);
        });
    });

    describe("HazelWriter#realloc", () => {
        it("Should reallocate the buffer in the hazel writer to a different size.", () => {
            const writer = HazelWriter.alloc(2);

            writer.realloc(8);
            assert.strictEqual(writer.size, 8);

            writer.realloc(3);
            assert.strictEqual(writer.size, 3);
        });
    });

    describe("HazelWriter#expand", () => {
        it("Should expand the buffer by a required number of bytes.", () => {
            const writer = HazelWriter.alloc(2);

            writer.expand(2);
            assert.strictEqual(writer.size, 2);

            writer.expand(6);
            assert.strictEqual(writer.size, 6);
        });

        it("Should throw if the value is not an integer", () => {
            const writer = HazelWriter.alloc(0);

            assert.throws(() => {
                writer.expand(("hello" as unknown) as number);
            });

            assert.throws(() => {
                writer.expand(({} as unknown) as number);
            });

            assert.throws(() => {
                writer.expand((true as unknown) as number);
            });
        });

        it("Should throw if the value is less than 0", () => {
            const writer = HazelWriter.alloc(0);

            assert.throws(() => {
                writer.expand(-1);
            });

            assert.throws(() => {
                writer.expand(-432);
            });

            assert.throws(() => {
                writer.expand(-90);
            });
        });
    });

    describe("HazelWriter#uint8", () => {
        it("Should write an unsigned 8-bit integer value to the buffer.", () => {
            const writer = HazelWriter.alloc(0);

            writer.uint8(23);
            writer.uint8(92);
            writer.uint8(1);

            assert.strictEqual(writer.buffer[0], 23);
            assert.strictEqual(writer.buffer[1], 92);
            assert.strictEqual(writer.buffer[2], 1);
        });

        it("Should write increase the cursor by 1.", () => {
            const writer = HazelWriter.alloc(0);

            assert.strictEqual(writer.cursor, 0);
            writer.uint8(5);
            assert.strictEqual(writer.cursor, 1);
            writer.uint8(65);
            assert.strictEqual(writer.cursor, 2);
            writer.uint8(43);
            assert.strictEqual(writer.cursor, 3);
        });

        it("Should throw if the value is not an integer.", () => {
            const writer = HazelWriter.alloc(1);

            assert.throws(() => {
                writer.uint8((true as unknown) as number);
            });

            assert.throws(() => {
                writer.uint8(({} as unknown) as number);
            });

            assert.throws(() => {
                writer.uint8(("hello" as unknown) as number);
            });
        });

        it("Should throw if the value is out of bounds.", () => {
            const writer = HazelWriter.alloc(1);

            assert.throws(() => {
                writer.uint8(-1);
            });

            assert.throws(() => {
                writer.uint8(256);
            });

            assert.throws(() => {
                writer.uint8(2 ** 32);
            });
        });
    });
});
