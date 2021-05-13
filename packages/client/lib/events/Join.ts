import { ClientEvent } from "./ClientEvent";

/**
 * Emitted when the client joins a game.
 */
export class ClientJoinEvent extends ClientEvent {
    static eventNamee = "client.join" as const;
    eventName = "client.join" as const;
}
