import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CloseDoorsOfTypeMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CloseDoorsOfType as const;
    messageTag = RpcMessageTag.CloseDoorsOfType as const;

    systemid: number;

    constructor(systemid: number) {
        super();

        this.systemid = systemid;
    }

    static Deserialize(reader: HazelReader) {
        const systemid = reader.uint8();

        return new CloseDoorsOfTypeMessage(systemid);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.systemid);
    }
}
