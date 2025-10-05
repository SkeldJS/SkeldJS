import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetNameplateMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetNameplate as const;
    messageTag = RpcMessageTag.SetNameplate as const;

    constructor(public readonly nameplateId: string, public readonly sequenceId: number) {
        super();
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
