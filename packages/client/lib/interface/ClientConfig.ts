import { GameKeyword, HostableOptions } from "@skeldjs/core";

export interface ClientConfig extends HostableOptions {
    /**
     * Whether or not to allow host actions to take place.
     */
    allowHost: boolean;

    /**
     * The client's language. Used to localise messages from the server.
     */
    language: GameKeyword;
}
