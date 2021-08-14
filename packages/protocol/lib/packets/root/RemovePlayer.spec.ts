import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { MessageDirection } from "../../PacketDecoder";

import { RemovePlayerMessage } from "./RemovePlayer";

describe("RemovePlayerMessage", () => {
    describe("RemovePlayerMessage#Deserialize", () => {
        it("Should deserialize a client-bound remove game root message.", () => {
            const reader = HazelReader.from(
                "40f8778cd48d0000728d000000",
                "hex"
            );
            const packet = RemovePlayerMessage.Deserialize(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.RemovePlayer);
            assert.strictEqual(packet.code, -1938294720);
            assert.strictEqual(packet.clientid, 36308);
            assert.strictEqual(packet.hostid, 36210);
            assert.strictEqual(packet.reason, DisconnectReason.None);
        });

        it("Should deserialize a server-bound remove game root message.", () => {
            const reader = HazelReader.from("40f8778cd49b0200", "hex");
            const packet = RemovePlayerMessage.Deserialize(
                reader,
                MessageDirection.Serverbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.RemovePlayer);
            assert.strictEqual(packet.code, -1938294720);
            assert.strictEqual(packet.clientid, 36308);
            assert.strictEqual(packet.reason, DisconnectReason.None);
        });
    });

    describe("RemovePlayerMessage#Serialize", () => {
        it("Should serialize a client-bound redirect root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new RemovePlayerMessage(
                "GXTYKF",
                36308,
                DisconnectReason.None,
                36210
            );

            packet.Serialize(writer, MessageDirection.Clientbound);

            assert.strictEqual(
                writer.toString("hex"),
                "40f8778cd48d0000728d000000"
            );
        });

        it("Should serialize a server-bound redirect root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new RemovePlayerMessage(
                "GXTYKF",
                36308,
                DisconnectReason.None
            );

            packet.Serialize(writer, MessageDirection.Serverbound);

            assert.strictEqual(writer.toString("hex"), "40f8778cd49b0200");
        });
    });
});
