import { RpcMessageTag, Skin } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetSkinMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetSkin as const;
    messageTag = RpcMessageTag.SetSkin as const;

    skin: Skin;

    constructor(skin: Skin) {
        super();

        this.skin = skin;
    }

    static Deserialize(reader: HazelReader) {
        const skin = reader.upacked();

        return new SetSkinMessage(skin);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.skin);
    }

    clone() {
        return new SetSkinMessage(this.skin);
    }
}
