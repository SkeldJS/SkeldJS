import { BaseMessage } from "./BaseMessage";

export class RootPacket extends BaseMessage {
    constructor(tag: number) {
        super(tag);
    }
}
