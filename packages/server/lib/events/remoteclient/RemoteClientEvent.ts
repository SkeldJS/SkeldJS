import { RemoteClient } from "../../RemoteClient";
import { SkeldjsServer } from "../../server";
import { ServerEvent } from "../ServerEvent";

export class RemoteClientEvent extends ServerEvent {
    remote: RemoteClient;

    constructor(
        server: SkeldjsServer,
        remote: RemoteClient
    ) {
        super(server);

        this.remote = remote;
    }
}
