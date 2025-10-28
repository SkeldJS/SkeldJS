import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckSporeTriggerMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckSporeTrigger;

    constructor(public readonly mushroomId: number) {
        super(CheckSporeTriggerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const mushroomId = reader.packed();

        return new CheckSporeTriggerMessage(mushroomId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.mushroomId);
    }

    clone() {
        return new CheckSporeTriggerMessage(this.mushroomId);
    }
}
