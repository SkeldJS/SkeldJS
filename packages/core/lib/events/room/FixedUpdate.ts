import { BaseGameDataMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class RoomFixedUpdateEvent extends RoomEvent {
    static eventName = "room.fixedupdate" as const;
    eventName = "room.fixedupdate" as const;

    stream: BaseGameDataMessage[];

    constructor(room: Hostable<any>, stream: BaseGameDataMessage[]) {
        super(room);

        this.stream = stream;
    }
}
