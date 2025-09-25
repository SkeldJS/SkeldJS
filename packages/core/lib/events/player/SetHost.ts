import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player becomes the host of the room.
 *
 * This event contains a `setHost` method that does not do anything in SkeldJS
 * as the host of the room is decided by the server, making it impossible to alter
 * the host as a client.
 *
 * A server implementation may implement this by overriding the functions in
 * {@link StatefulRoom} responsible for updating the host.
 */
export class PlayerSetHostEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.sethost" as const;
    eventName = "player.sethost" as const;

    private _alteredHost: Player<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>
    ) {
        super();

        this._alteredHost = player;
    }

    /**
     * The altered player that will be made host instead, if changed.
     */
    get alteredHost() {
        return this._alteredHost;
    }

    /**
     * Change the player that was made host.
     * @param player The player to make host.
     */
    setHost(player: Player<RoomType>) {
        this._alteredHost = player;
    }
}
