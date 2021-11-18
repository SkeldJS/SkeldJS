import { Color, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ProtectPlayerMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ProtectPlayer as const;
    messageTag = RpcMessageTag.ProtectPlayer as const;

    targetNetId: number;
    colorId: Color;

    constructor(targetNetId: number, colorId: Color) {
        super();

        this.targetNetId = targetNetId;
        this.colorId = colorId;
    }

    static Deserialize(reader: HazelReader) {
        const victimNetId = reader.upacked();
        const colorId = reader.uint8();

        return new ProtectPlayerMessage(victimNetId, colorId);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.targetNetId);
        writer.uint8(this.colorId);
    }

    clone() {
        return new ProtectPlayerMessage(this.targetNetId, this.colorId);
    }
}
