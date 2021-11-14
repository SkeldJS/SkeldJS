import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class RepairSystemMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.RepairSystem as const;
    messageTag = RpcMessageTag.RepairSystem as const;

    systemId: number;
    netId: number;
    amount: number;

    constructor(systemId: number, netId: number, amount: number) {
        super();

        this.systemId = systemId;
        this.netId = netId;
        this.amount = amount;
    }

    static Deserialize(reader: HazelReader) {
        const systemid = reader.uint8();
        const netId = reader.upacked();
        const amount = reader.uint8();

        return new RepairSystemMessage(systemid, netId, amount);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.systemId);
        writer.upacked(this.netId);
        writer.uint8(this.amount);
    }

    clone() {
        return new RepairSystemMessage(this.systemId, this.netId, this.amount);
    }
}
