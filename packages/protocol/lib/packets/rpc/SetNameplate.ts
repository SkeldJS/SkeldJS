import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetNameplateMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetNameplate as const;
    messageTag = RpcMessageTag.SetNameplate as const;

    nameplateId: string;

    constructor(nameplateId: string) {
        super();

        this.nameplateId = nameplateId;
    }

    static Deserialize(reader: HazelReader) {
        const nameplateId = reader.string();

        return new SetNameplateMessage(nameplateId);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.nameplateId);
    }

    clone() {
        return new SetNameplateMessage(this.nameplateId);
    }
}
