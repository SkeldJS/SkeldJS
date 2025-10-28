import { BasicEvent, CancelableEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";
import { LobbyExtension } from "@skeldjs/protocol";

/**
 * Emitted when the server notifies the client that the lobby is about to close. This is
 * sometimes cancelable (see {@link LobbyTimeExpiring.availableExtension}) to ask the server
 * for more time.
 */
export class RoomLobbyTimeExpiringEvent<RoomType extends StatefulRoom> extends CancelableEvent implements RoomEvent<RoomType> {
    static eventName = "room.lobbytimeexpiring" as const;
    eventName = "room.lobbytimeexpiring" as const;

    constructor(
        public readonly room: RoomType,
        public readonly secondsRemaining: number,
        /**
         * Information about the extension that can be requested. If this is
         * null, the lobby timer can not be extended.
         */
        public readonly availableExtension: LobbyExtension|null,
    ) {
        super();
    }
}
