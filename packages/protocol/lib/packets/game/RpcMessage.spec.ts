

import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import assert from "assert";

import { RpcMessage } from "./RpcMessage";

describe("RpcMessage", () => {
    describe("RpcMessage#Deserialize", () => {
        it("Should deserialize an rpc game data message.", () => {
            const reader = HazelReader.from("cb02121d00", "hex");
            const packet = RpcMessage.Deserialize(reader);

            assert.strictEqual(packet.tag, GameDataMessageTag.RPC);
            assert.strictEqual(packet.callid, 18);
            assert.strictEqual(packet.netid, 331);
            assert.strictEqual(packet.data.byteLength, 2);
        });
    });

    describe("RpcMessage#Serialize", () => {
        it("Should serialize an rpc game data message.", () => {
            const writer = HazelWriter.alloc(0);
            const packet = new RpcMessage(331, 18, Buffer.from("1d00", "hex"));

            packet.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "cb02121d00");
        });
    });
});
