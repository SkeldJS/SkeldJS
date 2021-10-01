import { Color, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckColorMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckColor as const;
    messageTag = RpcMessageTag.CheckColor as const;

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

    clone() {
        return new CheckColorMessage(this.color);
    }
}
