import { CancelableEvent } from "@skeldjs/events";

import { SkeldjsServer } from "../server";

export class ServerEvent extends CancelableEvent {
    /**
     * The server in question.
     */
    server: SkeldjsServer;

    constructor(
        server: SkeldjsServer
    ) {
        super();

        this.server = server;
    }
}
