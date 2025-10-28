import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class TriggerSporesMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.TriggerSpores;

    constructor(public readonly mushroomId: number) {
        super(TriggerSporesMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const mushroomId = reader.int32();
        return new TriggerSporesMessage(mushroomId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.mushroomId);
    }

    clone() {
        return new TriggerSporesMessage(this.mushroomId);
    }
}
