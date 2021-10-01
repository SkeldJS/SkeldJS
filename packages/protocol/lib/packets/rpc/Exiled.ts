import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ExiledMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Exiled as const;
    messageTag = RpcMessageTag.Exiled as const;

    static Deserialize() {
        return new ExiledMessage;
    }

    clone() {
        return new ExiledMessage;
    }
}
