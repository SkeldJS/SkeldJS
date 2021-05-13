import { SkeldjsClient } from "../client";
import { ClientEvent } from "./ClientEvent";

/**
 * Emitted when the client connects to a server, before it identifies.
 */
export class ClientConnectEvent extends ClientEvent {
    static eventNamee = "client.connect" as const;
    eventName = "client.connect" as const;

    /**
     * The IP of the server that the client connected to.
     */
    ip: string;

    /**
     * The port of the server that the client connected to.
     */
    port: number;

    constructor(client: SkeldjsClient, ip: string, port: number) {
        super(client);

        this.ip = ip;
        this.port = port;
    }
}
