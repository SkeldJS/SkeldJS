import { QuickChatMode, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { GameSettings } from "../../misc";

import { MessageDirection } from "../../PacketDecoder";
import { HostGameMessage } from "./HostGame";

describe("HostGameMessage", () => {
    describe("HostGameMessage#Deserialize", () => {
        it("Should deserialize a client-bound host game root message.", () => {
            const reader = HazelReader.from("46e43c8c", "hex");
            const packet = HostGameMessage.Deserialize(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.HostGame);
            assert.strictEqual(packet.code, -1942166458);
        });

        it("Should deserialize a server-bound host game root message.", () => {
            const reader = HazelReader.from(
                "2a020a01000000000000803f0000803f0000c03f000034420101020100000002010f00000078000000000f02",
                "hex"
            );
            const packet = HostGameMessage.Deserialize(
                reader,
                MessageDirection.Serverbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.HostGame);
            assert.strictEqual(typeof packet.options, "object");
            assert.strictEqual(packet.quickchatMode, QuickChatMode.QuickChat);
        });
    });

    describe("HostGameMessage#Serialize", () => {
        it("Should serialize a client-bound host game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new HostGameMessage("FRIDAY");

            packet.Serialize(writer, MessageDirection.Clientbound);

            assert.strictEqual(writer.toString("hex"), "59986986");
        });

        it("Should serialize a server-bound host game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new HostGameMessage(
                new GameSettings,
                QuickChatMode.FreeChat
            );

            packet.Serialize(writer, MessageDirection.Serverbound);

            assert.ok(writer.toString("hex").startsWith("2e040a"));
        });
    });
});
