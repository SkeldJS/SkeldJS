import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ExitVentMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ExitVent;

    constructor(public readonly ventId: number) {
        super(ExitVentMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const ventId = reader.upacked();

        return new ExitVentMessage(ventId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.ventId);
    }

    clone() {
        return new ExitVentMessage(this.ventId);
    }
}
