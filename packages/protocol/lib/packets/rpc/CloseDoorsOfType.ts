import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CloseDoorsOfTypeMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CloseDoorsOfType;

    constructor(public readonly systemId: number) {
        super(CloseDoorsOfTypeMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const systemId = reader.uint8();
        return new CloseDoorsOfTypeMessage(systemId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.systemId);
    }

    clone() {
        return new CloseDoorsOfTypeMessage(this.systemId);
    }
}
