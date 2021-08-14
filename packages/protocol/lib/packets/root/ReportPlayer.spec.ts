import { ReportOutcome, ReportReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { MessageDirection } from "../../PacketDecoder";

import { ReportPlayerMessage } from "./ReportPlayer";

describe("ReportPlayerMessage", () => {
    describe("ReportPlayerMessage#Deserialize", () => {
        it("Should deserialize a client-bound report player root message.", () => {
            const reader = HazelReader.from("96e101020000000400", "hex");
            const packet = ReportPlayerMessage.Deserialize(
                reader,
                MessageDirection.Clientbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.ReportPlayer);
            assert.strictEqual(packet.clientid, 28822);
            assert.strictEqual(packet.reason, ReportReason.CheatingHacking);
            assert.strictEqual(packet.outcome, ReportOutcome.Reported);
            assert.strictEqual(packet.name, "");
        });

        it("Should deserialize a server-bound report player root message", () => {
            const reader = HazelReader.from("475ac28c96e10102", "hex");
            const packet = ReportPlayerMessage.Deserialize(
                reader,
                MessageDirection.Serverbound
            );

            assert.strictEqual(packet.messageTag, RootMessageTag.ReportPlayer);
            assert.strictEqual(packet.code, -1933419961);
            assert.strictEqual(packet.clientid, 28822);
            assert.strictEqual(packet.reason, ReportReason.CheatingHacking);
        });
    });

    describe("ReportPlayerMessage#Serialize", () => {
        it("Should serialize a client-bound report player root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new ReportPlayerMessage(
                28822,
                ReportReason.CheatingHacking,
                ReportOutcome.Reported,
                ""
            );

            packet.Serialize(writer, MessageDirection.Clientbound);

            assert.strictEqual(writer.toString("hex"), "96e101020000000400");
        });

        it("Should serialize a server-bound report player root message", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new ReportPlayerMessage(
                "FILLNF",
                28822,
                ReportReason.CheatingHacking
            );

            packet.Serialize(writer, MessageDirection.Serverbound);

            assert.strictEqual(writer.toString("hex"), "475ac28c96e10102");
        });
    });
});
