import { GameDataMessageTag, SpawnFlag, SpawnType } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { ComponentSpawnData } from "../../misc";

import { SpawnMessage } from "./Spawn";

describe("SpawnMessage", () => {
    describe("SpawnMessage#Deserialize", () => {
        it("Should deserialize a spawn game data message.", () => {
            const reader = HazelReader.from(
                "0484cc02010307020001010108000001090a00010000ff7fff7fff7fff7f",
                "hex"
            );
            const packet = SpawnMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, GameDataMessageTag.Spawn);
            assert.strictEqual(packet.spawnType, SpawnType.Player);
            assert.strictEqual(packet.ownerid, 42500);
            assert.strictEqual(packet.flags, SpawnFlag.IsClientCharacter);
            assert.strictEqual(packet.components.length, 3);
        });
    });

    describe("SpawnMessage#Serialize", () => {
        it("Should serialize a spawn game data message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new SpawnMessage(
                SpawnType.Player,
                42500,
                SpawnFlag.IsClientCharacter,
                [
                    new ComponentSpawnData(7, Buffer.from("0101", "hex")),
                    new ComponentSpawnData(8, Buffer.from("", "hex")),
                    new ComponentSpawnData(
                        9,
                        Buffer.from("0000ff7fff7fff7fff7f", "hex")
                    ),
                ]
            );

            packet.Serialize(writer);

            assert.strictEqual(
                writer.toString("hex"),
                "0484cc02010307020001010108000001090a00010000ff7fff7fff7fff7f"
            );
        });
    });
});
