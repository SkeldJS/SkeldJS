import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { DataMessage } from "./Data";

describe("DataMessage", () => {
    describe("DataMessage#Deserialize", () => {
        it("Should deserialize a data game data message.", () => {
            const reader = HazelReader.from("050400f57b1186ff7fff7f", "hex");
            const packet = DataMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, GameDataMessageTag.Data);
            assert.strictEqual(packet.data.byteLength, 10);
            assert.strictEqual(packet.data[0], 4);
        });
    });

    describe("DataMessage#Serialize", () => {
        it("Should serialize a data game data message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new DataMessage(
                5,
                Buffer.from("0400f57b1186ff7fff7f", "hex")
            );

            packet.Serialize(writer);

            assert.strictEqual(
                writer.toString("hex"),
                "050400f57b1186ff7fff7f"
            );
        });
    });
});
