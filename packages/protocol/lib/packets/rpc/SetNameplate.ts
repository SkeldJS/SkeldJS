import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetNameplateMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetNameplate;

    constructor(public readonly nameplateId: string, public readonly sequenceId: number) {
        super(SetNameplateMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const nameplateId = reader.string();
        const sequenceId = reader.uint8();

        return new SetNameplateMessage(nameplateId, sequenceId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.nameplateId);
        writer.uint8(this.sequenceId);
    }

    clone() {
        return new SetNameplateMessage(this.nameplateId, this.sequenceId);
    }
}
