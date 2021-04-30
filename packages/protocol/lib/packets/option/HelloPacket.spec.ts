import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { HelloPacket } from "./HelloPacket";

describe("HelloPacket", () => {
    describe("HelloPacket#Deserialize", () => {
        it("Should deserialize a hello packet.", () => {
            const reader = HazelReader.from("000100cc0f030306616d6f677573021b53bc", "hex");
            const packet = HelloPacket.Deserialize(reader);

            assert.strictEqual(packet.tag, SendOption.Hello);
            assert.strictEqual(packet.nonce, 1);
            assert.strictEqual(packet.clientver, 50532300 /* 2021.4.2.0 */);
            assert.strictEqual(packet.username, "amogus");
            assert.strictEqual(packet.token, 3159563010);
        });
    });

    describe("HelloPacket#Serialize", () => {
        it("Should serialize a hello packet.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new HelloPacket(
                1,
                50532300,
                "mary poppins",
                69
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "000100cc0f03030c6d61727920706f7070696e7345000000");
        });
    });
});
