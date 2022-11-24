import { BaseMessage } from "@skeldjs/protocol";

export class BaseReactorMessage extends BaseMessage {
    static messageType = "reactor" as const;
    messageType = "reactor" as const;
}
