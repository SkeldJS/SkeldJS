import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { HazelWriter } from "@skeldjs/hazel";

export class VanishMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Vanish;

    constructor() { super(VanishMessage.messageTag) }

    static deserializeFromReader() {
        return new VanishMessage;
    }

    serializeToWriter(writer: HazelWriter): void {
        void writer;
    }

    clone() {
        return new VanishMessage;
    }
}
