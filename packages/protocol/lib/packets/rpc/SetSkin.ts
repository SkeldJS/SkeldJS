import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetSkinMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetSkin as const;
    messageTag = RpcMessageTag.SetSkin as const;

    constructor(public readonly skinId: string, public readonly sequenceId: number) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const skinId = reader.string();
        const sequenceId = reader.uint8();

        return new SetSkinMessage(skinId, sequenceId);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.skinId);
        writer.uint8(this.sequenceId);
    }

    clone() {
        return new SetSkinMessage(this.skinId, this.sequenceId);
    }
}
