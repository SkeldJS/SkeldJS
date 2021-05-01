import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter, VersionInfo } from "@skeldjs/util";
import assert from "assert";

import { HelloPacket } from "./HelloPacket";

describe("HelloPacket", () => {
    describe("HelloPacket#Deserialize", () => {
        it("Should deserialize a hello packet.", () => {
            const reader = HazelReader.from("000100cc0f030306616d6f677573021b53bc", "hex");
            const packet = HelloPacket.Deserialize(reader);

            assert.strictEqual(packet.tag, SendOption.Hello);
            assert.strictEqual(packet.nonce, 1);
            assert.strictEqual(packet.clientver.year, 2021);
            assert.strictEqual(packet.clientver.month, 4);
            assert.strictEqual(packet.clientver.day, 2);
            assert.strictEqual(packet.clientver.revision, 0);
            assert.strictEqual(packet.username, "amogus");
            assert.strictEqual(packet.token, 3159563010);
        });
    });

    describe("HelloPacket#Serialize", () => {
        it("Should serialize a hello packet.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new HelloPacket(
                1,
                new VersionInfo(2021, 4, 2),
                "mary poppins",
                69
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "000100cc0f03030c6d61727920706f7070696e7345000000");
        });
    });
});
