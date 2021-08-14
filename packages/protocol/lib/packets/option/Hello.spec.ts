import { GameKeyword, QuickChatMode, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter, VersionInfo } from "@skeldjs/util";
import assert from "assert";

import { HelloPacket } from "./Hello";

describe("HelloPacket", () => {
    describe("HelloPacket#Deserialize", () => {
        it("Should deserialize a hello packet.", () => {
            const reader = HazelReader.from(
                "000100cc0f030306616d6f677573021b53bc0001000001",
                "hex"
            );
            const packet = HelloPacket.Deserialize(reader);

            assert.strictEqual(packet.messageTag, SendOption.Hello);
            assert.strictEqual(packet.nonce, 1);
            assert.strictEqual(packet.clientver.year, 2021);
            assert.strictEqual(packet.clientver.month, 4);
            assert.strictEqual(packet.clientver.day, 2);
            assert.strictEqual(packet.clientver.revision, 0);
            assert.strictEqual(packet.username, "amogus");
            assert.strictEqual(packet.token, 3159563010);
            assert.strictEqual(packet.language, GameKeyword.English);
            assert.strictEqual(packet.chatMode, QuickChatMode.FreeChat);
        });
    });

    describe("HelloPacket#Serialize", () => {
        it("Should serialize a hello packet.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new HelloPacket(
                1,
                new VersionInfo(2021, 4, 2),
                "mary poppins",
                69,
                GameKeyword.English,
                QuickChatMode.FreeChat
            );

            packet.Serialize(writer);

            assert.strictEqual(
                writer.toString("hex"),
                "000100cc0f03030c6d61727920706f7070696e73450000000001000001"
            );
        });
    });
});
