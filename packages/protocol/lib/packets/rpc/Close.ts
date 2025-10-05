import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CloseMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Close as const;
    messageTag = RpcMessageTag.Close as const;

    static deserializeFromReader() {
        return new CloseMessage;
    }

    clone() {
        return new CloseMessage;
    }
}
