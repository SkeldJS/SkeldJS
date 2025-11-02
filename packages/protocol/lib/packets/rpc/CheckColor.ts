import { Color, RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
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
