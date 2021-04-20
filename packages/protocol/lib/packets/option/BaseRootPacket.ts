import { BaseMessage } from "../BaseMessage";

export class BaseRootPacket extends BaseMessage {
    static type = "option" as const;
    type = "option" as const;

    constructor() {
        super();
    }
}
