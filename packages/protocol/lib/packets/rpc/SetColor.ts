import { Color, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetColorMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetColor as const;
    messageTag = RpcMessageTag.SetColor as const;

    color: Color;

    constructor(color: Color) {
        super();

        this.color = color;
    }

    static Deserialize(reader: HazelReader) {
        const color = reader.uint8();

        return new SetColorMessage(color);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.color);
    }

    clone() {
        return new SetColorMessage(this.color);
    }
}
