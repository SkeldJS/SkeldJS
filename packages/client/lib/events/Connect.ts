import { CancelableEvent } from "@skeldjs/events";

export class ClientConnectEvent extends CancelableEvent {
    static eventNamee = "client.connect" as const;
    eventName = "client.connect" as const;

    ip: string;
    port: number;

    constructor(
        ip: string,
        port: number
    ) {
        super();

        this.ip = ip;
        this.port = port;
    }
}
