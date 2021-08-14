import { GameDataMessageTag, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { BaseGameDataMessage } from "../game";

import { GameDataMessage } from "./GameData";

export class FakeSpawnMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Spawn as const;
    messageTag = GameDataMessageTag.Spawn as const;
}

describe("GameDataMessage", () => {
    describe("GameDataMessage#Deserialize", () => {
        it("Should deserialize a alter game root message.", () => {
            const decoder = new PacketDecoder;

            const reader = HazelReader.from(
                "48daca8c21000403feffffff0f00025e1000010100076861696c657920076d020000005f010001001e000404e9ad02010360020001000061000001620a00010100c27ab286ff7fff7f0c000402feffffff0f000163000001",
                "hex"
            );
            const packet = GameDataMessage.Deserialize(
                reader,
                MessageDirection.Clientbound,
                decoder
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.GameData);
            assert.strictEqual(packet.code, -1932862904);
            assert.strictEqual(packet.children.length, 3);
            assert.deepStrictEqual(
                packet.children.map((child) => child.messageTag),
                [
                    GameDataMessageTag.Spawn,
                    GameDataMessageTag.Spawn,
                    GameDataMessageTag.Spawn,
                ]
            );
        });
    });

    describe("GameDataMessage#Serialize", () => {
        it("Should serialize a alter game root message.", () => {
            const decoder = new PacketDecoder;

            const writer = HazelWriter.alloc(0);
            const packet = new GameDataMessage("GITWMF", [
                new FakeSpawnMessage,
                new FakeSpawnMessage,
                new FakeSpawnMessage,
            ]);

            packet.Serialize(writer, MessageDirection.Clientbound, decoder);

            assert.strictEqual(
                writer.toString("hex"),
                "48daca8c000004000004000004"
            );
        });
    });
});
