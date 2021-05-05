import { CancelableEvent } from "@skeldjs/events";
import { DisconnectReason } from "@skeldjs/constant";

/**
 * Emitted when client disconnects from the server.
 */
export class ClientDisconnectEvent extends CancelableEvent {
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

    constructor(reason: DisconnectReason, message?: string) {
        super();

        this.reason = reason;
        this.message = message;
    }
}
