import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UsePlatformMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.UsePlatform as const;
    messageTag = RpcMessageTag.UsePlatform as const;

    static Deserialize() {
        return new UsePlatformMessage;
    }

    clone() {
        return new UsePlatformMessage;
    }
}
