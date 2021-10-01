import { GameOverReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { EndGameMessage } from "./EndGame";

describe("EndGameMessage", () => {
    describe("EndGameMessage#Deserialize", () => {
        it("Should deserialize a end game root message.", () => {
            const reader = HazelReader.from("48daca8c0300", "hex");
            const packet = EndGameMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.EndGame);
            assert.strictEqual(packet.code, -1932862904);
            assert.strictEqual(packet.reason, GameOverReason.ImpostorByKill);
            assert.strictEqual(packet.showAd, false);
        });
    });

    describe("EndGameMessage#Serialize", () => {
        it("Should serialize a end game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new EndGameMessage(
                "GITWMF",
                GameOverReason.ImpostorByKill,
                false
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "48daca8c0300");
        });
    });
});
