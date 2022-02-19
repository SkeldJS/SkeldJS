import { Platform, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { QueryPlatformIdsMessage } from "./QueryPlatformIds";
import { PlatformSpecificData } from "../../misc";

describe("QueryPlatformIdsMessage", () => {
    describe("QueryPlatformIdsMessage#Deserialize", () => {
        it("Should deserialize a server-bound query platform IDs root message.", () => {
            const reader = HazelReader.from("3bbe258c", "hex");
            const packet = QueryPlatformIdsMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.QueryPlatformIds);
            assert.strictEqual(packet.gameCode, -1943683525);
            assert.deepStrictEqual(packet.roomPlayersPlatforms, Array<PlatformSpecificData>());
        });
        it("Should deserialize a client-bound query platform IDs root message.", () => {
            const reader = HazelReader.from("3bbe258c09000208544553544e414d4509000508544553544e414d450900030854" +
                "4553544e414d4509000708544553544e414d4509000608544553544e414d45", "hex");
            const packet = QueryPlatformIdsMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.QueryPlatformIds);
            assert.strictEqual(packet.gameCode, -1943683525);
            assert.deepStrictEqual(packet.roomPlayersPlatforms, Array<PlatformSpecificData>(
                new PlatformSpecificData(Platform.StandaloneSteamPC, "TESTNAME"),
                new PlatformSpecificData(Platform.StandaloneItch, "TESTNAME"),
                new PlatformSpecificData(Platform.StandaloneMac, "TESTNAME"),
                new PlatformSpecificData(Platform.Android, "TESTNAME"),
                new PlatformSpecificData(Platform.IPhone, "TESTNAME")));
        });
    });

    describe("QueryPlatformIdsMessage#Serialize", () => {
        it("Should serialize a server-bound query platform IDs root message.", () => {
            const writer = HazelWriter.alloc(4);
            const packet = new QueryPlatformIdsMessage(
                -1943683525,
                Array<PlatformSpecificData>()
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "3bbe258c");
        });
        it("Should serialize a client-bound query platform IDs root message.", () => {
            const writer = HazelWriter.alloc(64);
            const packet = new QueryPlatformIdsMessage(
                -1943683525,
                Array<PlatformSpecificData>(
                    new PlatformSpecificData(Platform.StandaloneSteamPC, "TESTNAME"),
                    new PlatformSpecificData(Platform.StandaloneItch, "TESTNAME"),
                    new PlatformSpecificData(Platform.StandaloneMac, "TESTNAME"),
                    new PlatformSpecificData(Platform.Android, "TESTNAME"),
                    new PlatformSpecificData(Platform.IPhone, "TESTNAME"))
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"),
                "3bbe258c09000208544553544e414d4509000508544553544e414d4509000308544553544e414d4509000708" +
                "544553544e414d4509000608544553544e414d45");
        });
    });
});
