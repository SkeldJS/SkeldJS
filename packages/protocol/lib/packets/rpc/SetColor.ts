import { Color, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetColorMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetColor as const;
    messageTag = RpcMessageTag.SetColor as const;

    constructor(public readonly netIdToColor: number, public readonly color: Color) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const netIdToColor = reader.uint32();
        const color = reader.uint8();
        return new SetColorMessage(netIdToColor, color);
    }

    Serialize(writer: HazelWriter) {
        writer.uint32(this.netIdToColor);
        writer.uint8(this.color);
    }

    clone() {
        return new SetColorMessage(this.netIdToColor, this.color);
    }
}
