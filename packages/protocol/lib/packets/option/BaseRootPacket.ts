import { BaseMessage } from "../BaseMessage";

export class BaseRootPacket extends BaseMessage {
    static messageType = "option" as const;
    messageType = "option" as const;

    clone(): BaseRootPacket {
        return super.clone() as BaseRootPacket;
    }
}
