import assert from "assert"

import {
    SentPacket,
    createMissingBitfield,
    getMissing
} from "./SentPacket"

describe("Acknowledgement packet utility functions", () => {
    describe("createMissingBitfield", () => {
        it("Should create a bitfield of all missing packets that haven't been acknowledged.", () => {
            const sent: SentPacket[] = [{
                nonce: 8,
                ackd: true
            }, {
                nonce: 7,
                ackd: false
            }, {
                nonce: 6,
                ackd: false
            }, {
                nonce: 5,
                ackd: true
            }, {
                nonce: 4,
                ackd: false
            }, {
                nonce: 3,
                ackd: false
            }, {
                nonce: 2,
                ackd: false
            }, {
                nonce: 1,
                ackd: false
            }];

            assert.strictEqual(createMissingBitfield(sent), 0b00001001);
        });
    });

    describe("getMissing", () => {
        it("Should get all missing packets from a bitfield.", () => {
            const recv = [8, 7, 6, 5, 4, 3, 2, 1];

            assert.deepStrictEqual(getMissing(recv, 0b10010011), [1, 2, 5, 8]);
        });
    });
});