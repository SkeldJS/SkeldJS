import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ShapeshiftMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Shapeshift as const;
    messageTag = RpcMessageTag.Shapeshift as const;

    targetNetId: number;
    doAnimation: boolean;

    constructor(targetNetId: number, doAnimation: boolean) {
        super();

        this.targetNetId = targetNetId;
        this.doAnimation = doAnimation;
    }

    static Deserialize(reader: HazelReader) {
        const victimNetId = reader.upacked();
        const doAnimation = reader.bool();

        return new ShapeshiftMessage(victimNetId, doAnimation);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.targetNetId);
        writer.bool(this.doAnimation);
    }

    clone() {
        return new ShapeshiftMessage(this.targetNetId, this.doAnimation);
    }
}
