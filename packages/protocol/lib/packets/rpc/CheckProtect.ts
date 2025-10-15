import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckProtectMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckProtect;

    constructor(public readonly targetNetId: number) {
        super(CheckProtectMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const targetNetId = reader.upacked();
        return new CheckProtectMessage(targetNetId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.targetNetId);
    }

    clone() {
        return new CheckProtectMessage(this.targetNetId);
    }
}
