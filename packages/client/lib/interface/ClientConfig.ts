import { GameKeyword, HostableOptions, QuickChatMode } from "@skeldjs/core";

export interface ClientConfig extends HostableOptions {
    /**
     * Whether or not to allow host actions to take place.
     */
    allowHost: boolean;

    /**
     * Whether to attempt to authorise with the server to connect to.
     */
    attemptAuth: boolean;

    /**
     * The client's language. Used to localise messages from the server.
     */
    language: GameKeyword;

    /**
     * The quick chat mode for the client. The server prevents you from joining
     * rooms with a quick chat mode if the client has free chat enbled.
     */
    chatMode: QuickChatMode;

    /**
     * Whether to make sure messages received from the server are handled in the
     * correct order.
     */
    messageOrdering: boolean;
}
