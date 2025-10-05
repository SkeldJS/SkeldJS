import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetHatMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetHat as const;
    messageTag = RpcMessageTag.SetHat as const;

    constructor(public readonly hatId: string, public readonly sequenceId: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const hatId = reader.string();
        const sequenceId = reader.uint8();

        return new SetHatMessage(hatId, sequenceId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.hatId);
        writer.uint8(this.sequenceId);
    }

    clone() {
        return new SetHatMessage(this.hatId, this.sequenceId);
    }
}
