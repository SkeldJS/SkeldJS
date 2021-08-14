import { BaseMessage } from "../BaseMessage";

export class BaseRpcMessage extends BaseMessage {
    static type = "rpc" as const;
    type = "rpc" as const;
}
