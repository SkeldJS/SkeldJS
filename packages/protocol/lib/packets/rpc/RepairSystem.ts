import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class RepairSystemMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.RepairSystem;

    constructor(public readonly systemId: number, public readonly netId: number, public readonly amount: number) {
        super(RepairSystemMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const systemid = reader.uint8();
        const netId = reader.upacked();
        const amount = reader.uint8();

        return new RepairSystemMessage(systemid, netId, amount);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.systemId);
        writer.upacked(this.netId);
        writer.uint8(this.amount);
    }

    clone() {
        return new RepairSystemMessage(this.systemId, this.netId, this.amount);
    }
}
