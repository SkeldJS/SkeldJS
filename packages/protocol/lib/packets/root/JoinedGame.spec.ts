import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { JoinedGameMessage } from "./JoinedGame";

describe("JoinedGameMessage", () => {
    describe("JoinedGameMessage#Deserialize", () => {
        it("Should deserialize a joined game root message.", () => {
            const reader = HazelReader.from(
                "88fd958cc3910000c790000001c7a102",
                "hex"
            );
            const packet = JoinedGameMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.JoinedGame);
            assert.strictEqual(packet.code, -1936327288);
            assert.strictEqual(packet.clientid, 37315);
            assert.strictEqual(packet.hostid, 37063);
            assert.deepStrictEqual(packet.others, [37063]);
        });
    });

    describe("JoinedGameMessage#Serialize", () => {
        it("Should serialize a joined game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new JoinedGameMessage("XJWWCF", 37315, 37063, [
                37063,
            ]);

            packet.Serialize(writer);

            assert.strictEqual(
                writer.toString("hex"),
                "88fd958cc3910000c790000001c7a102"
            );
        });
    });
});
