import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { MessageDirection } from "../../PacketDecoder";

import { RemovePlayerMessage } from "./RemovePlayer";

describe("RemovePlayerMessage", () => {
    describe("RemovePlayerMessage#Deserialize", () => {
        it("Should deserialize a client-bound remove game root message.", () => {
            const reader = HazelReader.from(
                "40f8778cd48d0000728d000011",
                "hex"
            );
            const packet = RemovePlayerMessage.deserializeFromReader(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.RemovePlayer);
            assert.strictEqual(packet.code, -1938294720);
            assert.strictEqual(packet.clientId, 36308);
            assert.strictEqual(packet.hostId, 36210);
            assert.strictEqual(packet.reason, DisconnectReason.Error);
        });

        it("Should deserialize a server-bound remove game root message.", () => {
            const reader = HazelReader.from("40f8778cd49b0211", "hex");
            const packet = RemovePlayerMessage.deserializeFromReader(
                reader,
                MessageDirection.Serverbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.RemovePlayer);
            assert.strictEqual(packet.code, -1938294720);
            assert.strictEqual(packet.clientId, 36308);
            assert.strictEqual(packet.reason, DisconnectReason.Error);
        });
    });

    describe("RemovePlayerMessage#Serialize", () => {
        it("Should serialize a client-bound redirect root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new RemovePlayerMessage(
                "GXTYKF",
                36308,
                DisconnectReason.Error,
                36210
            );

            packet.serializeToWriter(writer, MessageDirection.Clientbound);

            assert.strictEqual(
                writer.toString("hex"),
                "40f8778cd48d0000728d000011"
            );
        });

        it("Should serialize a server-bound redirect root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new RemovePlayerMessage(
                "GXTYKF",
                36308,
                DisconnectReason.Error
            );

            packet.serializeToWriter(writer, MessageDirection.Serverbound);

            assert.strictEqual(writer.toString("hex"), "40f8778cd49b0211");
        });
    });
});
