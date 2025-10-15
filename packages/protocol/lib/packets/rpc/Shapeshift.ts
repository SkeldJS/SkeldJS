import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ShapeshiftMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Shapeshift;

    constructor(public readonly targetNetId: number, public readonly doAnimation: boolean) {
        super(ShapeshiftMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const victimNetId = reader.upacked();
        const doAnimation = reader.bool();

        return new ShapeshiftMessage(victimNetId, doAnimation);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.targetNetId);
        writer.bool(this.doAnimation);
    }

    clone() {
        return new ShapeshiftMessage(this.targetNetId, this.doAnimation);
    }
}
