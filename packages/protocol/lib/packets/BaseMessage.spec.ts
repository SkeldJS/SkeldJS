import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";
import { MessageDirection, PacketDecoder } from "../PacketDecoder";

import { BaseMessage } from "./BaseMessage";

describe("BaseMessage", () => {
    describe("BaseMessage#Deserialize", () => {
        it("Should throw when deserializing as there is nothing to deserialize.", () => {
            const decoder = new PacketDecoder;

            const reader = HazelReader.from("", "hex");

            assert.throws(() => {
                BaseMessage.Deserialize(
                    reader,
                    MessageDirection.Clientbound,
                    decoder
                );
            });
        });
    });

    describe("BaseMessage#Serialize", () => {
        it("Should serialize a base message.", () => {
            const decoder = new PacketDecoder;

            const writer = HazelWriter.alloc(0);
            const packet = new BaseMessage;

            packet.Serialize(writer, MessageDirection.Clientbound, decoder);

            assert.strictEqual(writer.toString("hex"), "");
        });
    });
});
