import { Hat, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetHatMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetHat as const;
    messageTag = RpcMessageTag.SetHat as const;

    hat: Hat;

    constructor(hat: Hat) {
        super();

        this.hat = hat;
    }

    static Deserialize(reader: HazelReader) {
        const hat = reader.upacked();

        return new SetHatMessage(hat);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.hat);
    }

    clone() {
        return new SetHatMessage(this.hat);
    }
}
