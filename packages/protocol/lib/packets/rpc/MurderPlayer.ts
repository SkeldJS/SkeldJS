import { MurderReasonFlags, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class MurderPlayerMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.MurderPlayer;

    constructor(public victimNetId: number, public reasonFlags: number) {
        super(MurderPlayerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const victimNetId = reader.upacked();
        const flags = reader.int32();

        return new MurderPlayerMessage(victimNetId, flags);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.victimNetId);
        writer.int32(this.reasonFlags);
    }

    clone() {
        return new MurderPlayerMessage(this.victimNetId, this.reasonFlags);
    }
}
