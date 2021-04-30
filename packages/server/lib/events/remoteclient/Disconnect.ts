import { DisconnectReason } from "@skeldjs/constant";
import { RemoteClient } from "../../RemoteClient";
import { SkeldjsServer } from "../../server";
import { RemoteClientEvent } from "./RemoteClientEvent";

/**
 * Emitted when a remote client disconnects from the server.
 */
export class RemoteClientDisconnectEvent extends RemoteClientEvent {
    static eventName = "remote.disconnect" as const;
    eventName = "remote.disconnect" as const;

    /**
     * The reason for why the client disconnected.
     */
    reason: DisconnectReason;

    /**
     * The message for why the client disconnected, if the reason is custom.
     */
    message?: string;

    constructor(
        server: SkeldjsServer,
        remote: RemoteClient,
        reason: DisconnectReason,
        message?: string
    ) {
        super(server, remote);

        this.reason = reason;
        this.message = message;
    }
}
