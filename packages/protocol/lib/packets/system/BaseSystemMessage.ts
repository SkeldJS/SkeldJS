import { BaseMessage } from "../BaseMessage";

export class BaseSystemMessage extends BaseMessage {
    static type = "system" as const;
    type = "system" as const;
}
