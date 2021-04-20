import { BaseMessage } from "../BaseMessage";

export class BaseGameDataMessage extends BaseMessage {
    static type = "gamedata" as const;
    type = "gamedata" as const;

    constructor() {
        super();
    }
}
