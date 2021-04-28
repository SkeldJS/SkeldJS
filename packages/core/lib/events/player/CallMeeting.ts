import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player calls a meeting, either by reporting a body or pressing the emergency meeting button.
 */
export class PlayerCallMeetingEvent extends PlayerEvent {
    static eventName = "player.callmeeting" as const;
    eventName = "player.callmeeting" as const;

    /**
     * Whether or not the meeting called is an emergency.
     */
    emergency: boolean;

    /**
     * The body that the player reported, if any.
     */
    body?: PlayerData;

    constructor(
        room: Hostable<any>,
        player: PlayerData,
        emergency: boolean,
        body?: PlayerData
    ) {
        super(room, player);

        this.emergency = emergency;
        this.body = body;
    }
}
