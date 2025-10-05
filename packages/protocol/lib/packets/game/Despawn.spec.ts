import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { DespawnMessage } from "./Despawn";

describe("DespawnMessage", () => {
    describe("DespawnMessage#Deserialize", () => {
        it("Should deserialize a client info game data message.", () => {
            const reader = HazelReader.from("05", "hex");
            const packet = DespawnMessage.deserializeFromReader(reader);

            assert.strictEqual(packet.messageTag, GameDataMessageTag.Despawn);
            assert.strictEqual(packet.netId, 5);
        });
    });

    describe("DespawnMessage#Serialize", () => {
        it("Should serialize a client info game data message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new DespawnMessage(5);

            packet.serializeToWriter(writer);

            assert.strictEqual(writer.toString("hex"), "05");
        });
    });
});
