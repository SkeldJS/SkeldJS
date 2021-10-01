import {
    GameKeyword,
    GameMap,
    QuickChatMode,
    RootMessageTag,
} from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { GameListing, GameSettings } from "../../misc";
import { MessageDirection } from "../../PacketDecoder";

import { GetGameListMessage } from "./GetGameList";

describe("GetGameListMessage", () => {
    describe("GetGameListMessage#Deserialize", () => {
        it("Should deserialize a client-bound get game list root message.", () => {
            const reader = HazelReader.from(
                "0c00010500000002000000400000001a0000170000ae7f721e9857895ab78c06506f6f6b656504a10400020a",
                "hex"
            );
            const packet = GetGameListMessage.Deserialize(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.gameCounts[GameMap.TheSkeld], 5);
            assert.strictEqual(packet.gameCounts[GameMap.MiraHQ], 2);
            assert.strictEqual(packet.gameCounts[GameMap.Polus], 64);

            assert.strictEqual(packet.messageTag, RootMessageTag.GetGameListV2);
            assert.strictEqual(packet.gameList.length, 1);
            assert.strictEqual(packet.gameList[0].ip, "174.127.114.30");
            assert.strictEqual(packet.gameList[0].port, 22424);
            assert.strictEqual(packet.gameList[0].code, -1934140791);
            assert.strictEqual(packet.gameList[0].name, "Pookee");
            assert.strictEqual(packet.gameList[0].numPlayers, 4);
            assert.strictEqual(packet.gameList[0].age, 545);
            assert.strictEqual(packet.gameList[0].map, GameMap.TheSkeld);
            assert.strictEqual(packet.gameList[0].numImpostors, 2);
            assert.strictEqual(packet.gameList[0].numPlayers, 4);
        });

        it("Should deserialize a server-bound get game list root message.", () => {
            const reader = HazelReader.from(
                "022e040a00010000000000803f0000803f0000c03f000034420101020100000002010f00000078000000000f0101000001",
                "hex"
            );
            const packet = GetGameListMessage.Deserialize(
                reader,
                MessageDirection.Serverbound
            );

            assert.strictEqual(packet.options.map, GameMap.TheSkeld);
            assert.strictEqual(packet.options.keywords, GameKeyword.English);
            assert.strictEqual(packet.options.numImpostors, 2);
        });
    });

    describe("GetGameListMessage#Serialize", () => {
        it("Should serialize a client-bound get game list root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new GetGameListMessage(
                [
                    new GameListing(
                        "AMTYIF",
                        "174.127.114.30",
                        22424,
                        "Pookee",
                        4,
                        545,
                        GameMap.TheSkeld,
                        2,
                        10
                    ),
                ],
                {
                    [GameMap.TheSkeld]: 5,
                    [GameMap.MiraHQ]: 2,
                    [GameMap.Polus]: 64,
                }
            );

            packet.Serialize(writer, MessageDirection.Clientbound);

            assert.strictEqual(
                writer.toString("hex"),
                "0c00010500000002000000400000001a0000170000ae7f721e9857895ab78c06506f6f6b656504a10400020a"
            );
        });

        it("Should serialize a server-bound get game list root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new GetGameListMessage(
                new GameSettings({
                    map: GameMap.TheSkeld,
                    keywords: GameKeyword.English,
                    numImpostors: 2,
                }),
                QuickChatMode.FreeChat
            );

            packet.Serialize(writer, MessageDirection.Serverbound);

            assert.strictEqual(
                writer.toString("hex"),
                "022e040a00010000000000803f0000803f0000c03f000034420101020100000002010f00000078000000000f0101000001"
            );
        });
    });
});
