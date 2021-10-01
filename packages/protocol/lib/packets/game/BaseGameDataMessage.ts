import { BaseMessage } from "../BaseMessage";

export class BaseGameDataMessage extends BaseMessage {
    static messageType = "gamedata" as const;
    messageType = "gamedata" as const;

    clone(): BaseGameDataMessage {
        return super.clone() as BaseGameDataMessage;
    }
}
