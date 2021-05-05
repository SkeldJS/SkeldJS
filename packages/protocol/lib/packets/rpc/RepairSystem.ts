import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class RepairSystemMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.RepairSystem as const;
    tag = RpcMessageTag.RepairSystem as const;

    systemid: number;
    netid: number;
    amount: number;

    constructor(systemid: number, netid: number, amount: number) {
        super();

        this.systemid = systemid;
        this.netid = netid;
        this.amount = amount;
    }

    static Deserialize(reader: HazelReader) {
        const systemid = reader.uint8();
        const netid = reader.upacked();
        const amount = reader.uint8();

        return new RepairSystemMessage(systemid, netid, amount);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.systemid);
        writer.upacked(this.netid);
        writer.uint8(this.amount);
    }
}
