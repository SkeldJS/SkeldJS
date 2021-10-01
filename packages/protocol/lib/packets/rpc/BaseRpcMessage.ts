import { BaseMessage } from "../BaseMessage";

export class BaseRpcMessage extends BaseMessage {
    static messageType = "rpc" as const;
    messageType = "rpc" as const;

    clone(): BaseRpcMessage {
        return super.clone() as BaseRpcMessage;
    }
}
