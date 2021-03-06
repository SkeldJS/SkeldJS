import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class MurderPlayerMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.MurderPlayer as const;
    tag = RpcMessageTag.MurderPlayer as const;

    victimid: number;

    constructor(victimid: number) {
        super();

        this.victimid = victimid;
    }

    static Deserialize(reader: HazelReader) {
        const victimid = reader.upacked();

        return new MurderPlayerMessage(victimid);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.victimid);
    }
}
