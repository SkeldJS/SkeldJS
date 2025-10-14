import { Color, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckColorMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckColor;

    constructor(public readonly color: Color) {
        super(CheckColorMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const color = reader.uint8();
        return new CheckColorMessage(color);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.color);
    }

    clone() {
        return new CheckColorMessage(this.color);
    }
}
