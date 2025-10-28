import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckShapeshiftMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckShapeshift;

    constructor(public readonly targetNetId: number, public readonly doAnimation: boolean) {
        super(CheckShapeshiftMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const victimNetId = reader.upacked();
        const doAnimation = reader.bool();

        return new CheckShapeshiftMessage(victimNetId, doAnimation);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.targetNetId);
        writer.bool(this.doAnimation);
    }

    clone() {
        return new CheckShapeshiftMessage(this.targetNetId, this.doAnimation);
    }
}
