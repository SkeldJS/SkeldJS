import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetHatMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetHat as const;
    messageTag = RpcMessageTag.SetHat as const;

    hatId: string;

    constructor(hatId: string) {
        super();

        this.hatId = hatId;
    }

    static Deserialize(reader: HazelReader) {
        const hatId = reader.string();

        return new SetHatMessage(hatId);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.hatId);
    }

    clone() {
        return new SetHatMessage(this.hatId);
    }
}
