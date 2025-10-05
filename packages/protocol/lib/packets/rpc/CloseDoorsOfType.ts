import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CloseDoorsOfTypeMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CloseDoorsOfType as const;
    messageTag = RpcMessageTag.CloseDoorsOfType as const;

    systemId: number;

    constructor(systemid: number) {
        super();

        this.systemId = systemid;
    }

    static deserializeFromReader(reader: HazelReader) {
        const systemid = reader.uint8();

        return new CloseDoorsOfTypeMessage(systemid);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.systemId);
    }

    clone() {
        return new CloseDoorsOfTypeMessage(this.systemId);
    }
}
