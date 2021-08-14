import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { StartGameMessage } from "./StartGame";

describe("StartGameMessage", () => {
    describe("StartGameMessage#Deserialize", () => {
        it("Should deserialize a start game root message.", () => {
            const reader = HazelReader.from("48daca8c", "hex");
            const packet = StartGameMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.StartGame);
            assert.strictEqual(packet.code, -1932862904);
        });
    });

    describe("StartGameMessage#Serialize", () => {
        it("Should serialize a start game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new StartGameMessage("GITWMF");

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "48daca8c");
        });
    });
});
