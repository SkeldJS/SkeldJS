import { DisconnectReason, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { DisconnectPacket } from "./Disconnect";

describe("DisconnectPacket", () => {
    describe("DisconnectPacket#Deserialize", () => {
        it("Should deserialize a disconnect packet with no extra data.", () => {
            const reader = HazelReader.from("", "hex");
            const packet = DisconnectPacket.Deserialize(reader);

            assert.strictEqual(packet.messageTag, SendOption.Disconnect);
            assert.strictEqual(packet.showReason, true);
            assert.strictEqual(packet.message, "");
            assert.strictEqual(packet.reason, DisconnectReason.None);
        });

        it("Should deserialize a disconnect packet with no reason.", () => {
            const reader = HazelReader.from("01", "hex");
            const packet = DisconnectPacket.Deserialize(reader);

            assert.strictEqual(packet.messageTag, SendOption.Disconnect);
            assert.strictEqual(packet.showReason, true);
            assert.strictEqual(packet.message, "");
            assert.strictEqual(packet.reason, DisconnectReason.None);
        });

        it("Should deserialize a disconnect packet with a reason.", () => {
            const reader = HazelReader.from("0101000001", "hex");
            const packet = DisconnectPacket.Deserialize(reader);

            assert.strictEqual(packet.messageTag, SendOption.Disconnect);
            assert.strictEqual(packet.showReason, true);
            assert.strictEqual(packet.message, "");
            assert.strictEqual(packet.reason, DisconnectReason.GameFull);
        });

        it("Should deserialize a disconnect packet with a custom reason.", () => {
            const reader = HazelReader.from(
                "010a000008087765616b65796573",
                "hex"
            );
            const packet = DisconnectPacket.Deserialize(reader);

            assert.strictEqual(packet.messageTag, SendOption.Disconnect);
            assert.strictEqual(packet.showReason, true);
            assert.strictEqual(packet.message, "weakeyes");
            assert.strictEqual(packet.reason, DisconnectReason.Custom);
        });
    });

    describe("DisconnectPacket#Serialize", () => {
        it("Should serialize a disconnect packet with no extra data.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new DisconnectPacket;

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "");
        });

        it("Should deserialize a disconnect packet with no reason.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new DisconnectPacket(undefined, undefined, true);

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "01");
        });

        it("Should serialize a disconnect packet with a reason.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new DisconnectPacket(DisconnectReason.GameNotFound);

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "0101000003");
        });

        it("Should serialize a disconnect packet with a custom reason.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new DisconnectPacket(
                DisconnectReason.Custom,
                "supercalifragilisticexpialidocious"
            );

            packet.Serialize(writer);

            assert.strictEqual(
                writer.toString("hex"),
                "012400000822737570657263616c6966726167696c697374696365787069616c69646f63696f7573"
            );
        });
    });
});
