import { BaseMessage } from "../BaseMessage";

export class BaseRootMessage extends BaseMessage {
    static type = "root" as const;
    type = "root" as const;

    constructor() {
        super();
    }
}
