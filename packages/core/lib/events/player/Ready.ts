import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player readies up to start the game.
 *
 * If the player fails to ready up or this event is canceled, they are kicked out of the game.
 */
export class PlayerReadyEvent extends PlayerEvent {
    static eventName = "player.ready" as const;
    eventName = "player.ready" as const;
}
