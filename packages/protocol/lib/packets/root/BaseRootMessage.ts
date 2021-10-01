import { BaseMessage } from "../BaseMessage";

export class BaseRootMessage extends BaseMessage {
    static messageType = "root" as const;
    messageType = "root" as const;

    clone(): BaseRootMessage {
        return super.clone() as BaseRootMessage;
    }
}
