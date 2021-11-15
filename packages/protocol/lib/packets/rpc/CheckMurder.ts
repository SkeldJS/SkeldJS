import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckMurderMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckMurder as const;
    messageTag = RpcMessageTag.CheckMurder as const;

    victimNetId: number;

    constructor(victimNetId: number) {
        super();

        this.victimNetId = victimNetId;
    }

    static Deserialize(reader: HazelReader) {
        const victimNetId = reader.upacked();

        return new CheckMurderMessage(victimNetId);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.victimNetId);
    }

    clone() {
        return new CheckMurderMessage(this.victimNetId);
    }
}
