import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetSkinMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetSkin as const;
    messageTag = RpcMessageTag.SetSkin as const;

    skinId: string;

    constructor(skinId: string) {
        super();

        this.skinId = skinId;
    }

    static Deserialize(reader: HazelReader) {
        const skinId = reader.string();

        return new SetSkinMessage(skinId);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.skinId);
    }

    clone() {
        return new SetSkinMessage(this.skinId);
    }
}
