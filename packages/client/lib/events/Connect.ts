import { CancelableEvent } from "@skeldjs/events";

/**
 * Emitted when the client connects to a server, before it identifies.
 */
export class ClientConnectEvent extends CancelableEvent {
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

    constructor(ip: string, port: number) {
        super();

        this.ip = ip;
        this.port = port;
    }
}
