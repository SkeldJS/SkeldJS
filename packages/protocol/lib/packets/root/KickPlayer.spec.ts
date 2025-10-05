import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { KickPlayerMessage } from "./KickPlayer";

describe("KickPlayerMessage", () => {
    describe("KickPlayerMessage#Deserialize", () => {
        it("Should deserialize a kick player root message.", () => {
            const reader = HazelReader.from("88fd958cc3a30211", "hex");
            const packet = KickPlayerMessage.deserializeFromReader(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.KickPlayer);
            assert.strictEqual(packet.code, -1936327288);
            assert.strictEqual(packet.clientId, 37315);
            assert.strictEqual(packet.banned, false);
        });
    });

    describe("KickPlayerMessage#Serialize", () => {
        it("Should serialize a kick player root message without a reason.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new KickPlayerMessage("XJWWCF", 37315, false);

            packet.serializeToWriter(writer);

            assert.strictEqual(writer.toString("hex"), "88fd958cc3a3020011");
        });

        it("Should serialize a kick player root message with a reason.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new KickPlayerMessage(
                "XJWWCF",
                37315,
                false,
                DisconnectReason.Hacking
            );

            packet.serializeToWriter(writer);

            assert.strictEqual(writer.toString("hex"), "88fd958cc3a302000a");
        });
    });
});
