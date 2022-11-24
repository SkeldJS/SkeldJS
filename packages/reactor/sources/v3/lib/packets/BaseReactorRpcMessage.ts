import { BaseMessage } from "@skeldjs/protocol";

export class BaseReactorRpcMessage extends BaseMessage {
    static messageType = "reactor-rpc" as const;
    messageType = "reactor-rpc" as const;

    static modId: string;
    modId!: string;

    clone() {
        return new BaseReactorRpcMessage;
    }
}
