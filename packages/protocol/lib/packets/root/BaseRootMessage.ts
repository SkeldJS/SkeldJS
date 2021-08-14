import { BaseMessage } from "../BaseMessage";

export class BaseRootMessage extends BaseMessage {
    static messageType = "root" as const;
    messageType = "root" as const;
}
