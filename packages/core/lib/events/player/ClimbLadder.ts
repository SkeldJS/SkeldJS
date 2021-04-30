import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player climbs a ladder.
 *
 * The direction is not given, and must be worked out manually.
 */
export class PlayerClimbLadderEvent extends PlayerEvent {
    static eventName = "player.climbladder" as const;
    eventName = "player.climbladder" as const;

    /**
     * The ID of the ladder that the player climbed.
     */
    ladderid: number;

    constructor(room: Hostable<any>, player: PlayerData, ladderid: number) {
        super(room, player);

        this.ladderid = ladderid;
    }
}
