import { BaseMessage } from "@skeldjs/protocol";

export class BaseReactorMessage extends BaseMessage {
    static type = "reactor" as const;
    type = "reactor" as const;
}