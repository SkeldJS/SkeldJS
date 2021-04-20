import { HazelReader, HazelWriter } from "@skeldjs/util";

import assert from "assert";

import { PlayerControl } from "./PlayerControl";

describe("PlayerControl", () => {
    describe("PlayerControl#Deserialize", () => {
        it("Should deserialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelReader.from("0105", "hex");
            control.Deserialize(reader, true);

            assert.ok(control.isNew);
            assert.strictEqual(control.playerId, 5);
        });

        it("Should deserialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelReader.from("0003", "hex");
            control.Deserialize(reader, true);

            assert.ok(!control.isNew);
            assert.strictEqual(control.playerId, 3);
        });

        it("Should deserialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelReader.from("03", "hex");
            control.Deserialize(reader, false);

            assert.strictEqual(control.playerId, 3);
        });

        it("Should deserialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelReader.from("07", "hex");
            control.Deserialize(reader, false);

            assert.strictEqual(control.playerId, 7);
        });
    });

    describe("PlayerControl#Serialize", () => {
        it("Should serialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: true,
                playerId: 5,
            });

            const writer = HazelWriter.alloc(0);
            control.Serialize(writer, true);

            assert.strictEqual(writer.toString("hex"), "0105");
        });

        it("Should serialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: false,
                playerId: 6,
            });

            const writer = HazelWriter.alloc(0);
            control.Serialize(writer, true);

            assert.strictEqual(writer.toString("hex"), "0006");
        });

        it("Should serialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: false,
                playerId: 1,
            });

            const writer = HazelWriter.alloc(0);
            control.Serialize(writer, false);

            assert.strictEqual(writer.toString("hex"), "01");
        });

        it("Should serialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: false,
                playerId: 10,
            });

            const writer = HazelWriter.alloc(0);
            control.Serialize(writer, false);

            assert.strictEqual(writer.toString("hex"), "0a");
        });
    });
});
