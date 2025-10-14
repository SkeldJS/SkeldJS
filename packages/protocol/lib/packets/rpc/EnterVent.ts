import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class EnterVentMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.EnterVent;

    constructor(public readonly ventId: number) {
        super(EnterVentMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const ventId = reader.upacked();

        return new EnterVentMessage(ventId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.ventId);
    }

    clone() {
        return new EnterVentMessage(this.ventId);
    }
}
