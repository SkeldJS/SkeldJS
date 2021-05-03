import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player reports a dead body or presses the emergency meeting button.
 *
 * Only received if the current client is the host.
 *
 * Can be canceled to prevent a meeting from taking place.
 * @example
 * ```ts
 * // Prevent the meeting from taking place if the player is the impostor.
 * client.on("player.reportbody", ev => {
 *   if (ev.player.data?.impostor) {
 *     ev.cancel();
 *   }
 * });
 * ```
 */
export class PlayerReportDeadBodyEvent extends PlayerEvent {
    static eventName = "player.reportbody" as const;
    eventName = "player.reportbody" as const;

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
