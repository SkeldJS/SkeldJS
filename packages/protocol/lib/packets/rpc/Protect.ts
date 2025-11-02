import { Color, RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ProtectPlayerMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ProtectPlayer;

    constructor(public readonly targetNetId: number, public readonly colorId: Color) {
        super(ProtectPlayerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const victimNetId = reader.upacked();
        const colorId = reader.uint8();

        return new ProtectPlayerMessage(victimNetId, colorId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.targetNetId);
        writer.uint8(this.colorId);
    }

    clone() {
        return new ProtectPlayerMessage(this.targetNetId, this.colorId);
    }
}
