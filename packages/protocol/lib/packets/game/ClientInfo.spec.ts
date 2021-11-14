import { GameDataMessageTag, RuntimePlatform } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { ClientInfoMessage } from "./ClientInfo";

describe("ClientInfoMessage", () => {
    describe("ClientInfoMessage#Deserialize", () => {
        it("Should deserialize a client info game data message.", () => {
            const reader = HazelReader.from("cdc8e90202", "hex");
            const packet = ClientInfoMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, GameDataMessageTag.ClientInfo);
            assert.strictEqual(packet.clientId, 5923917);
            assert.strictEqual(packet.platform, RuntimePlatform.WindowsPlayer);
        });
    });

    describe("ClientInfoMessage#Serialize", () => {
        it("Should serialize a client info game data message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new ClientInfoMessage(
                5923917,
                RuntimePlatform.WindowsPlayer
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "cdc8e90202");
        });
    });
});
