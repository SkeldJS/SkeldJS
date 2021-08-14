import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { SceneChangeMessage } from "./SceneChange";

describe("SceneChangeMessage", () => {
    describe("SceneChangeMessage#Deserialize", () => {
        it("Should deserialize an rpc game data message.", () => {
            const reader = HazelReader.from(
                "84cc020a4f6e6c696e6547616d65",
                "hex"
            );
            const packet = SceneChangeMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, GameDataMessageTag.SceneChange);
            assert.strictEqual(packet.clientid, 42500);
            assert.strictEqual(packet.scene, "OnlineGame");
        });
    });

    describe("SceneChangeMessage#Serialize", () => {
        it("Should serialize an rpc game data message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new SceneChangeMessage(42500, "OnlineGame");

            packet.Serialize(writer);

            assert.strictEqual(
                writer.toString("hex"),
                "84cc020a4f6e6c696e6547616d65"
            );
        });
    });
});
