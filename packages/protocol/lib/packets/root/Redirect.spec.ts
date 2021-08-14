import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { RedirectMessage } from "./Redirect";

describe("RedirectMessage", () => {
    describe("RedirectMessage#Deserialize", () => {
        it("Should deserialize a redirect root message.", () => {
            const reader = HazelReader.from("800ed372cf56", "hex");
            const packet = RedirectMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.Redirect);
            assert.strictEqual(packet.ip, "128.14.211.114");
            assert.strictEqual(packet.port, 22223);
        });
    });

    describe("RedirectMessage#Serialize", () => {
        it("Should serialize a redirect root message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new RedirectMessage("128.14.211.114", 22223);

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "800ed372cf56");
        });
    });
});
