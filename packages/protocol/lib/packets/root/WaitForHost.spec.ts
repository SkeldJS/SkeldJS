import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { WaitForHostMessage } from "./WaitForHost";

describe("WaitForHostMessage", () => {
    describe("WaitForHostMessage#Deserialize", () => {
        it("Should deserialize a start game root message.", () => {
            const reader = HazelReader.from("48daca8cbf970000", "hex");
            const packet = WaitForHostMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.WaitForHost);
            assert.strictEqual(packet.code, -1932862904);
            assert.strictEqual(packet.clientid, 38847);
        });
    });

    describe("WaitForHostMessage#Serialize", () => {
        it("Should serialize a start game root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new WaitForHostMessage("GITWMF", 38847);

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "48daca8cbf970000");
        });
    });
});
