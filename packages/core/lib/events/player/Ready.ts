import { BasicEvent } from "@skeldjs/events";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player readies up to start the game.
 *
 * If a player fails to ready up within a specified time, they are kicked from
 * the game.
 */
export class PlayerReadyEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.ready" as const;
    eventName = "player.ready" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>
    ) {
        super();
    }
}
