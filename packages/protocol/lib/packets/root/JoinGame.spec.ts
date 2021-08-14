import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { MessageDirection } from "../../PacketDecoder";

import { JoinGameMessage } from "./JoinGame";

describe("JoinGameMessage", () => {
    describe("JoinGameMessage#Deserialize", () => {
        it("Should deserialize a client-bound non-error join game root message.", () => {
            const reader = HazelReader.from("25e53c8ceaaa000075aa0000", "hex");
            const packet = JoinGameMessage.Deserialize(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.JoinGame);
            assert.strictEqual(packet.code, -1942166235);
            assert.strictEqual(packet.clientid, 43754);
            assert.strictEqual(packet.hostid, 43637);
        });

        it("Should deserialize a client-bound error join game root message.", () => {
            const reader = HazelReader.from("03000000", "hex");
            const packet = JoinGameMessage.Deserialize(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.JoinGame);
            assert.strictEqual(packet.error, DisconnectReason.GameNotFound);
        });

        it("Should deserialize a client-bound custom error join game root message.", () => {
            const reader = HazelReader.from(
                "080000000d796f7520617265206c61726765",
                "hex"
            );
            const packet = JoinGameMessage.Deserialize(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.JoinGame);
            assert.strictEqual(packet.error, DisconnectReason.Custom);
            assert.strictEqual(packet.message, "you are large");
        });

        it("Should deserialize a server-bound join game root message.", () => {
            const reader = HazelReader.from("da413f8a", "hex");
            const packet = JoinGameMessage.Deserialize(
                reader,
                MessageDirection.Serverbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.JoinGame);
            assert.strictEqual(packet.code, -1975565862);
        });
    });

    describe("JoinGameMessage#Serialize", () => {
        it("Should serialize a client-bound non-error join game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new JoinGameMessage("XJWWCF", 44463, 44408);

            packet.Serialize(writer, MessageDirection.Clientbound);

            assert.strictEqual(
                writer.toString("hex"),
                "88fd958cafad000078ad0000"
            );
        });

        it("Should serialize a client-bound error join game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new JoinGameMessage(DisconnectReason.GameNotFound);

            packet.Serialize(writer, MessageDirection.Clientbound);

            assert.strictEqual(writer.toString("hex"), "03000000");
        });

        it("Should serialize a client-bound custom error join game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new JoinGameMessage(
                DisconnectReason.Custom,
                "you are large"
            );

            packet.Serialize(writer, MessageDirection.Clientbound);

            assert.strictEqual(
                writer.toString("hex"),
                "080000000d796f7520617265206c61726765"
            );
        });

        it("Should serialize a server-bound join game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new JoinGameMessage("LOLSUS");

            packet.Serialize(writer, MessageDirection.Serverbound);

            assert.strictEqual(writer.toString("hex"), "da413f8a");
        });
    });
});
