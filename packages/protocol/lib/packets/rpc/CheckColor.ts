import { Color, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckColorMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.CheckColor as const;
    tag = RpcMessageTag.CheckColor as const;

    color: Color;

    constructor(color: Color) {
        super();

        this.color = color;
    }

    static Deserialize(reader: HazelReader) {
        const color = reader.uint8();

        return new CheckColorMessage(color);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.color);
    }
}
