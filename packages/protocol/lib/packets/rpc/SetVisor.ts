import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetVisorMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetVisor as const;
    messageTag = RpcMessageTag.SetVisor as const;

    visorId: string;

    constructor(visorId: string) {
        super();

        this.visorId = visorId;
    }

    static Deserialize(reader: HazelReader) {
        const visorId = reader.string();

        return new SetVisorMessage(visorId);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.visorId);
    }

    clone() {
        return new SetVisorMessage(this.visorId);
    }
}
