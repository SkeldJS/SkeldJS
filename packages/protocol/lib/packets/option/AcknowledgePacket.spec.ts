import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { AcknowledgePacket } from "./AcknowledgePacket";

describe("AcknowledgePacket", () => {
    describe("AcknowledgePacket#Deserialize", () => {
        it("Should deserialize an acknowledgement packet.", () => {
            const reader = HazelReader.from("0700f5", "hex");
            const packet = AcknowledgePacket.Deserialize(reader);

            assert.strictEqual(packet.tag, SendOption.Acknowledge);
            assert.strictEqual(packet.nonce, 1792);
            assert.deepStrictEqual(packet.missingPackets, [1, 3]);
        });
    });

    describe("AcknowledgePacket#Serialize", () => {
        it("Should serialize an acknowledgement packet.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new AcknowledgePacket(
                15,
                [4, 5, 6]
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "000f8f");
        });
    });
});
