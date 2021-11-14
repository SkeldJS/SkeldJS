import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { ReadyMessage } from "./Ready";

describe("ReadyMessage", () => {
    describe("ReadyMessage#Deserialize", () => {
        it("Should deserialize a ready game data message.", () => {
            const reader = HazelReader.from("e5af02", "hex");
            const packet = ReadyMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, GameDataMessageTag.Ready);
            assert.strictEqual(packet.clientId, 38885);
        });
    });

    describe("ReadyMessage#Serialize", () => {
        it("Should serialize a ready game data message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new ReadyMessage(38885);

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "e5af02");
        });
    });
});
