import { AlterGameTag, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { AlterGameMessage } from "./AlterGame";

describe("AlterGameMessage", () => {
    describe("AlterGameMessage#Deserialize", () => {
        it("Should deserialize a alter game root message.", () => {
            const reader = HazelReader.from("48daca8c0101", "hex");
            const packet = AlterGameMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.AlterGame);
            assert.strictEqual(packet.code, -1932862904);
            assert.strictEqual(packet.alterTag, AlterGameTag.ChangePrivacy);
            assert.strictEqual(packet.value, 1);
        });
    });

    describe("AlterGameMessage#Serialize", () => {
        it("Should serialize a alter game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new AlterGameMessage(
                "GITWMF",
                AlterGameTag.ChangePrivacy,
                1
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "48daca8c0101");
        });
    });
});
