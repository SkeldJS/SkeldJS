import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { PingPacket } from "./Ping";

describe("PingPacket", () => {
    describe("PingPacket#Deserialize", () => {
        it("Should deserialize a ping packet.", () => {
            const reader = HazelReader.from("0231", "hex");
            const packet = PingPacket.Deserialize(reader);

            assert.strictEqual(packet.messageTag, SendOption.Ping);
            assert.strictEqual(packet.nonce, 561);
        });
    });

    describe("PingPacket#Serialize", () => {
        it("Should serialize a ping packet.", () => {
            const writer = HazelWriter.alloc(2);
            const packet = new PingPacket(72);

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "0048");
        });
    });
});
