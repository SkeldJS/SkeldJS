import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { RemoveGameMessage } from "./RemoveGameMessage";

describe("RemoveGameMessage", () => {
    describe("RemoveGameMessage#Deserialize", () => {
        it("Should deserialize a remove game root message.", () => {
            const reader = HazelReader.from("13", "hex");
            const packet = RemoveGameMessage.Deserialize(reader);

            assert.strictEqual(packet.tag, RootMessageTag.RemoveGame);
            assert.strictEqual(packet.reason, DisconnectReason.ServerRequest);
        });
    });

    describe("RemoveGameMessage#Serialize", () => {
        it("Should serialize a redirect root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new RemoveGameMessage(
                DisconnectReason.ServerRequest
            );

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "13");
        });
    });
});
