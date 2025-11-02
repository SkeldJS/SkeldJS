import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckMurderMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckMurder;

    constructor(public readonly victimNetId: number) {
        super(CheckMurderMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const victimNetId = reader.upacked();
        return new CheckMurderMessage(victimNetId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.victimNetId);
    }

    clone() {
        return new CheckMurderMessage(this.victimNetId);
    }
}
