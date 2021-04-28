import { CancelableEvent } from "@skeldjs/events";
import { DisconnectReason } from "@skeldjs/constant";

export class ClientDisconnectEvent extends CancelableEvent {
    static eventNamee = "client.disconnect" as const;
    eventName = "client.disconnect" as const;

    reason: DisconnectReason;
    message?: string;

    constructor(
        reason: DisconnectReason,
        message?: string
    ) {
        super();

        this.reason = reason;
        this.message = message;
    }
}
