import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when the ship status of the room chooses who the impostors will be.
 *
 * Can be used to change the logic of how impostors are set.
 *
 * @example
 * ```ts
 * client.on("room.selectimpostors", ev => {
 *   ev.setImpostors([ client.host ]);
 * });
 * ```
 */
export class RoomSelectImpostorsEvent extends RoomEvent {
    static eventName = "room.selectimpostors" as const;
    eventName = "room.selectimpostors" as const;

    /**
     * The impostors that were selected by the room.
     */
    impostors: PlayerData[];

    constructor(room: Hostable<any>, impostors: PlayerData[]) {
        super(room);

        this.impostors = impostors;
    }

    setImpostors(players: PlayerData[]) {
        this.impostors = players;
    }
}
