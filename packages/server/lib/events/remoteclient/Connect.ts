import { RemoteClient } from "../../RemoteClient";
import { SkeldjsServer } from "../../server";
import { RemoteClientEvent } from "./RemoteClientEvent";

/**
 * Emitted when a remote client connects to the server.
 */
export class RemoteClientConnectEvent extends RemoteClientEvent {
    static eventName = "remote.connect" as const;
    eventName = "remote.connect" as const;

    /**
     * The username of the remote client.
     */
    username: string;

    /**
     * The version of the remote's among us client.
     */
    version: number;

    constructor(
        server: SkeldjsServer,
        remote: RemoteClient,
        username: string,
        version: number
    ) {
        super(server, remote);

        this.username = username;
        this.version = version;
    }
}
