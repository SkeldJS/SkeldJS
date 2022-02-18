import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { SetActivePodTypeMessage } from "./SetActivePodType";

describe("SetActivePodTypeMessage", () => {
    describe("SetActivePodTypeMessage#Deserialize", () => {
        it("Should deserialize a set active pod type root message.", () => {
            const reader = HazelReader.from("0a706f64732f656d707479", "hex");
            const packet = SetActivePodTypeMessage.Deserialize(reader);

            assert.strictEqual(packet.messageTag, RootMessageTag.SetActivePodType);
            assert.strictEqual(packet.podType, "pods/empty");
        });
    });

    describe("SetActivePodTypeMessage#Serialize", () => {
        it("Should serialize a set active pod type root message.", () => {
            const writer = HazelWriter.alloc(11);
            const packet = new SetActivePodTypeMessage("pods/empty");

            packet.Serialize(writer);

            assert.strictEqual(writer.toString(), "0a706f64732f656d707479");
        });
    });
});
