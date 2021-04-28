import { RemoteClient } from "../../RemoteClient";
import { Room } from "../../Room";
import { SkeldjsServer } from "../../server";
import { RemoteClientEvent } from "./RemoteClientEvent";

/**
 * Emitted when a remote client looks for a game by a game code.
 */
export class RemoteClientJoinRoomEvent extends RemoteClientEvent {
    static eventName = "remote.joinroom" as const;
    eventName = "remote.joinroom" as const;

    /**
     * The code that the remote client inputted.
     */
    code: number;

    /**
     * The room that was found, if any.
     */
    found?: Room;

    constructor(
        server: SkeldjsServer,
        remote: RemoteClient,
        code: number,
        found?: Room
    ) {
        super(server, remote);

        this.code = code;
        this.found = found;
    }
}
