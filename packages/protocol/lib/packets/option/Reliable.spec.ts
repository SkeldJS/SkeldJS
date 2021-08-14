import { AlterGameTag, RootMessageTag, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { AlterGameMessage, JoinedGameMessage } from "../root";
import { ReliablePacket } from "./Reliable";

describe("ReliablePacket", () => {
    describe("ReliablePacket#Deserialize", () => {
        it("Should deserialize a reliable packet.", () => {
            const decoder = new PacketDecoder;

            const reader = HazelReader.from(
                "00020d000746e43c8c9a9e00009a9e00000006000a46e43c8c0100",
                "hex"
            );
            const packet = ReliablePacket.Deserialize(
                reader,
                MessageDirection.Clientbound,
                decoder
            );

            assert.strictEqual(packet.messageTag, SendOption.Reliable);
            assert.strictEqual(packet.nonce, 2);
            assert.strictEqual(packet.children.length, 2);
            assert.strictEqual(
                packet.children[0].messageTag,
                RootMessageTag.JoinedGame
            );
            assert.strictEqual(
                packet.children[1].messageTag,
                RootMessageTag.AlterGame
            );
        });
    });

    describe("ReliablePacket#Serialize", () => {
        it("Should serialize a reliable packet.", () => {
            const decoder = new PacketDecoder;

            const writer = HazelWriter.alloc(0);
            const packet = new ReliablePacket(32, [
                new JoinedGameMessage("OXCJDF", 40602, 40602, []),
                new AlterGameMessage("OXCJDF", AlterGameTag.ChangePrivacy, 0),
            ]);

            packet.Serialize(writer, MessageDirection.Clientbound, decoder);

            assert.strictEqual(
                writer.toString("hex"),
                "00200d000746e43c8c9a9e00009a9e00000006000a46e43c8c0100"
            );
        });
    });
});
