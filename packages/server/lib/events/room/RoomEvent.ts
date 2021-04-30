import { Room } from "../../Room";
import { SkeldjsServer } from "../../server";
import { ServerEvent } from "../ServerEvent";

export class RoomEvent extends ServerEvent {
    /**
     * The room in question.
     */
    room: Room;

    constructor(
        server: SkeldjsServer,
        room: Room
    ) {
        super(server);

        this.room = room;
    }
}
