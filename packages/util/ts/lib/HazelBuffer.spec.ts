import assert from "assert";
import util from "util";

import {
    HazelBuffer
} from "./HazelBuffer";

describe("HazelBuffer", () => {
    describe("HazelBuffer#alloc", () => {
        it("Should allocate a hazel buffer of a specified length and encoding.", () => {
            const buffer = HazelBuffer.alloc(6);

            assert(buffer instanceof HazelBuffer);
            assert.strictEqual(buffer.size, 6);

            const invalid_buffer_size = HazelBuffer.alloc(-5);

            assert.strictEqual(invalid_buffer_size.size, 0);
        });
    });

    describe("HazelBuffer#from", () => {
        it("Should create a hazel buffer from a string or int array and a given encoding.", () => {
            const buffer = HazelBuffer.from("2f74ec9d1cf31d58b6ec", "hex");

            assert.strictEqual(buffer.size, 10);
            assert.strictEqual(buffer.at(3), 0x9d);
            assert.strictEqual(buffer.at(6), 0x1d);


            const buffer2 = HazelBuffer.from([0x89, 0x0c, 0xd7, 0x15, 0x94, 0x16, 0x62, 0x2d, 0x4e, 0x51]);

            assert.strictEqual(buffer2.size, 10);
            assert.strictEqual(buffer2.at(3), 0x15);
            assert.strictEqual(buffer2.at(6), 0x62);
        });
    });

    describe("HazelBuffer#util.inspect.custom", () => {
        it("Should produce a short inspection of the buffer from a util.inspect call.", () => {
            const buffer = HazelBuffer.from([0x20, 0x7b, 0x6d, 0x2a, 0x79, 0xde, 0x0c, 0xdf, 0xdd, 0x65]);

            assert.strictEqual(util.inspect(buffer), "<HazelBuffer 20 7b 6d 2a 79 de 0c df dd 65>");
        });
    });

    describe("HazelBuffer#size", () => {
        it("Should return the size of the buffer.", () => {
            const buffer = HazelBuffer.from([0xd2, 0xe8, 0x2f, 0x27, 0xf0, 0x6c, 0x39, 0xa1, 0x20, 0x75, 0x64, 0x84, 0x80, 0x87, 0x32, 0x7a, 0x70, 0xc5, 0x50, 0x52, 0xa1, 0x53, 0x3d, 0x80, 0x1a, 0x35, 0x1f, 0x83, 0x0f, 0x90, 0x41, 0xb1]);

            assert.strictEqual(buffer.size, 32);
        });
    });

    describe("HazelBuffer#left", () => {
        it("Should return the number of bytes left in the reader.", () => {
            const buffer = HazelBuffer.from([0x8b, 0x41, 0x16, 0x99, 0xc7, 0x78, 0xb5, 0x78, 0x5a, 0x63, 0xd8, 0x8c, 0xe5, 0x00, 0x56, 0xe7, 0xe1, 0x1e, 0xca, 0x84, 0x7d, 0xd3, 0x5b, 0x6f, 0x45, 0x10, 0x29, 0x9a, 0x37, 0x43, 0x83, 0x65]);

            buffer.cursor = 15;
            assert.strictEqual(buffer.left, 17);
        });
    });

    describe("HazelBuffer#toString", () => {
        it("Should convert the buffer to a string.", () => {
            const buffer = HazelBuffer.from([0xfc, 0x48, 0x84, 0xb0, 0x43]);

            assert.strictEqual(buffer.toString(), "fc4884b043");
        });

        it("Should convert the buffer to a string with a custom encoding.", () => {
            const buffer = HazelBuffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);

            assert.strictEqual(buffer.toString("utf-8"), "Hello");
        });
    });

    describe("HazelBuffer#goto", () => {
        it("Should move the cursor to a specific position in the buffer.", () => {
            const buffer = HazelBuffer.from([0x78, 0xa5, 0xb1, 0xb2, 0x69, 0xa2, 0x4b, 0x83, 0xe8, 0x62, 0x36, 0xc1]);

            buffer.goto(3);
            assert.strictEqual(buffer.cursor, 3);
            buffer.goto(65);
            assert.strictEqual(buffer.cursor, 65);
            buffer.goto(35);
            assert.strictEqual(buffer.cursor, 35);
        });
    });

    describe("HazelBuffer#jump", () => {
        it("Should jump a specified number of bytes.", () => {
            const buffer = HazelBuffer.from([0x54, 0x9a, 0x4b, 0xce, 0x17, 0xfd, 0xc3, 0x67, 0xbf, 0x8a, 0x4a, 0xe5]);

            buffer.jump(8).jump(4).jump(2);
            assert.strictEqual(buffer.cursor, 14);
        });
    });

    describe("HazelBuffer#realloc", () => {
        it("Should reallocate the memory in the buffer to a new amount of bytes.", () => {
            const buffer = HazelBuffer.from([0x41, 0xde, 0x41, 0x64, 0x84, 0x51, 0x59, 0x78, 0x77, 0xcb, 0xc2, 0x8f]);

            const old_buffer = buffer.buffer;
            buffer.realloc(8);

            assert.notStrictEqual(old_buffer, buffer.buffer);
            assert.strictEqual(buffer.size, 8);
        });
    });

    describe("HazelBuffer#expand", () => {
        it("Should expand the buffer by a given amount of bytes if required.", () => {
            const buffer = HazelBuffer.from([0x9c, 0x8b, 0x8b, 0x04, 0xff, 0xb2, 0x29, 0x1b, 0x15, 0x53, 0x9f, 0xbd]);

            buffer.expand(6);
            assert.strictEqual(buffer.size, 12);
            buffer.expand(13);
            assert.strictEqual(buffer.size, 13);

            buffer.goto(8);
            buffer.expand(7);
            assert.strictEqual(buffer.size, 15);
        });
    });

    describe("HazelBuffer#at", () => {
        it("Should get a byte at a given position.", () => {
            const buffer = HazelBuffer.from([0x54, 0xb3, 0x4d, 0xaf, 0x96, 0x03, 0xcd, 0x92, 0x84, 0x09, 0xc7, 0xa9]);

            assert.strictEqual(buffer.at(6), 0xcd);
            assert.strictEqual(buffer.at(9), 0x09);
        });
    });

    describe("HazelBuffer#uint8", () => {
        it("Should read an unsigned 8-bit integer.", () => {
            const buffer = HazelBuffer.from([0x11, 0x4e, 0xa5, 0xe6, 0x47, 0x07, 0x6f, 0xb4, 0xe2, 0xde, 0x43, 0xbe]);

            const num1 = buffer.uint8();
            const num2 = buffer.uint8();
            const num3 = buffer.uint8();
            assert.strictEqual(num1, 0x11);
            assert.strictEqual(num2, 0x4e);
            assert.strictEqual(num3, 0xa5);
        });

        it("Should write an unsigned 8-bit integer.", () => {
            const buffer = HazelBuffer.alloc(3);

            buffer.uint8(0x97);
            buffer.uint8(0xf5);
            buffer.uint8(0xff);

            assert.strictEqual(buffer.toString(), "97f5ff");
        });
    });
});
