import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class BootFromVentMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.BootFromVent;

    constructor(public readonly ventId: number) {
        super(BootFromVentMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const ventId = reader.upacked();
        return new BootFromVentMessage(ventId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.ventId);
    }

    clone() {
        return new BootFromVentMessage(this.ventId);
    }
}
