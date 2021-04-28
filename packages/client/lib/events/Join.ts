import { CancelableEvent } from "@skeldjs/events";

/**
 * Emitted when the client joins a game.
 */
export class ClientJoinEvent extends CancelableEvent {
    static eventNamee = "client.join" as const;
    eventName = "client.join" as const;
}
