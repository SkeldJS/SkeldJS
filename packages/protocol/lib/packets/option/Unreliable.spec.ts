import { RootMessageTag, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { DataMessage } from "../game";
import { GameDataMessage } from "../root";
import { UnreliablePacket } from "./Unreliable";

describe("UnreliablePacket", () => {
    describe("UnreliablePacket#Deserialize", () => {
        it("Should deserialize an unreliable packet.", () => {
            const decoder = new PacketDecoder;

            const reader = HazelReader.from(
                "12000546e43c8c0b0001050500f67b1186ff7fff7f",
                "hex"
            );
            const packet = UnreliablePacket.Deserialize(
                reader,
                MessageDirection.Clientbound,
                decoder
            );

            assert.strictEqual(packet.messageTag, SendOption.Unreliable);
            assert.strictEqual(packet.children.length, 1);
            assert.strictEqual(packet.children[0].messageTag, RootMessageTag.GameData);
        });
    });

    describe("UnreliablePacket#Serialize", () => {
        it("Should serialize an unreliable packet.", () => {
            const decoder = new PacketDecoder;

            const writer = HazelWriter.alloc(0);
            const packet = new UnreliablePacket([
                new GameDataMessage("OXCJDF", [
                    new DataMessage(
                        5,
                        Buffer.from("0300f67b1186ff7fff7f", "hex")
                    ),
                ]),
            ]);

            packet.Serialize(writer, MessageDirection.Clientbound, decoder);

            assert.strictEqual(
                writer.toString("hex"),
                "12000546e43c8c0b0001050300f67b1186ff7fff7f"
            );
        });
    });
});
