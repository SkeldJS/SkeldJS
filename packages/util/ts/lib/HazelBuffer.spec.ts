import assert from "assert"

import {
    HazelBuffer
} from "./HazelBuffer"

describe("HazelBuffer", () => {
    describe("HazelBuffer#alloc", () => {
        it("Should allocate a hazel buffer of a specified length and encoding.", () => {
            const buffer = HazelBuffer.alloc(6);

            assert(buffer instanceof HazelBuffer);
            assert.strictEqual(buffer.size, 6);
            assert([...buffer].every(byte => byte === 0));

            const invalid_buffer_size = HazelBuffer.alloc(-5);

            assert.strictEqual(invalid_buffer_size.size, 0);
        });
    });

    describe("HazelBuffer#from", () => {
        it("Should create a hazel buffer from a string or int array and a given encoding.", () => {
            const buffer = HazelBuffer.from("0038000e01021800000f4575726f70652d4d61737465722d31ac69fbaa0756fe131800000f4575726f70652d4d61737465722d33ac68817f07568315");

            assert.strictEqual(buffer.at(3), 0x0e);
            assert.strictEqual(buffer.at(48), 0x65);
            assert.strictEqual(buffer.size, 60);
        });
    });
});