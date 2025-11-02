import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CloseDoorsOfTypeMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CloseDoorsOfType;

    constructor(public readonly systemType: number) {
        super(CloseDoorsOfTypeMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const systemId = reader.uint8();
        return new CloseDoorsOfTypeMessage(systemId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.systemType);
    }

    clone() {
        return new CloseDoorsOfTypeMessage(this.systemType);
    }
}
