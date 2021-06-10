import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ExiledMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.Exiled as const;
    tag = RpcMessageTag.Exiled as const;

    static Deserialize() {
        return new ExiledMessage;
    }
}
