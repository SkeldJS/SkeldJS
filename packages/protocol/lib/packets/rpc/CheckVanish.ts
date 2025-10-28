import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckVanishMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckVanish;

    constructor(public readonly maxDuration: number) {
        super(CheckVanishMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const maxDuration = reader.float();
        return new CheckVanishMessage(maxDuration);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.float(this.maxDuration);
    }

    clone() {
        return new CheckVanishMessage(this.maxDuration);
    }
}
