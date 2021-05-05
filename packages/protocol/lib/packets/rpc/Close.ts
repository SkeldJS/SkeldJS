import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CloseMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.Close as const;
    tag = RpcMessageTag.Close as const;
}
