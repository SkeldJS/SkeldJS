import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class MurderPlayerMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.MurderPlayer as const;
    messageTag = RpcMessageTag.MurderPlayer as const;

    victimNetId: number;

    constructor(victimNetId: number) {
        super();

        this.victimNetId = victimNetId;
    }

    static deserializeFromReader(reader: HazelReader) {
        const victimNetId = reader.upacked();

        return new MurderPlayerMessage(victimNetId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.victimNetId);
    }

    clone() {
        return new MurderPlayerMessage(this.victimNetId);
    }
}
