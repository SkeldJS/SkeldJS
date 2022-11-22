import { BaseMessage } from "@skeldjs/protocol";

export class BaseReactorRpcMessage extends BaseMessage {
    static messageType = "reactor-rpc" as const;
    messageType = "reactor-rpc" as const;

    clone() {
        return new BaseReactorRpcMessage;
    }
}
