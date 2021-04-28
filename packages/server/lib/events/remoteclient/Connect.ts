import { RemoteClient } from "../../RemoteClient";
import { SkeldjsServer } from "../../server";
import { RemoteClientEvent } from "./RemoteClientEvent";

export class RemoteClientConnectEvent extends RemoteClientEvent {
    static eventName = "remote.connect" as const;
    eventName = "remote.connect" as const;

    username: string;
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
