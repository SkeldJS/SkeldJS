import { DisconnectReason } from "@skeldjs/constant";
import { SkeldjsClient } from "../client";
import { ClientEvent } from "./ClientEvent";

/**
 * Emitted when client disconnects from the server.
 */
export class ClientDisconnectEvent extends ClientEvent {
    static eventNamee = "client.disconnect" as const;
    eventName = "client.disconnect" as const;

    /**
     * The reason why the client disconnected.
     */
    reason: DisconnectReason;

    /**
     * The message for the reason, if the reason is custom.
     */
    message?: string;

    constructor(client: SkeldjsClient, reason: DisconnectReason = DisconnectReason.None, message?: string) {
        super(client);

        this.reason = reason;
        this.message = message;
    }
}
