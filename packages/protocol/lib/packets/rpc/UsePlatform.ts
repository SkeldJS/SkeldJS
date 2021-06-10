import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UsePlatformMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.UsePlatform as const;
    tag = RpcMessageTag.UsePlatform as const;

    static Deserialize() {
        return new UsePlatformMessage;
    }
}
