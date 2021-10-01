import { BaseMessage } from "../BaseMessage";

export class BaseSystemMessage extends BaseMessage {
    static messageType = "system" as const;
    messageType = "system" as const;

    clone(): BaseSystemMessage {
        return super.clone() as BaseSystemMessage;
    }
}
