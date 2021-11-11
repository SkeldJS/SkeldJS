import { SkeldjsClient } from "../client";
import { ClientEvent } from "./ClientEvent";

export class ClientIdentifyEvent extends ClientEvent {
    static eventName = "client.identify" as const;
    eventName = "client.identify" as const;

    /**
     * The username that the client is identifying with.
     */
    username: string;

    /**
     * The token for
     */
    authToken: number;

    constructor(client: SkeldjsClient, username: string, authToken: number) {
        super(client);

        this.username = username;
        this.authToken = authToken;
    }
}
