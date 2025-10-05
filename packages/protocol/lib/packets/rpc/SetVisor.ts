import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetVisorMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetVisor as const;
    messageTag = RpcMessageTag.SetVisor as const;

    constructor(public readonly visorId: string, public readonly sequenceId: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const visorId = reader.string();
        const sequenceId = reader.uint8();

        return new SetVisorMessage(visorId, sequenceId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.visorId);
        writer.uint8(this.sequenceId);
    }

    clone() {
        return new SetVisorMessage(this.visorId, this.sequenceId);
    }
}
