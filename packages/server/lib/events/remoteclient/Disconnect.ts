import { DisconnectReason } from "@skeldjs/constant";
import { RemoteClient } from "../../RemoteClient";
import { SkeldjsServer } from "../../server";
import { RemoteClientEvent } from "./RemoteClientEvent";

export class RemoteClientDisconnectEvent extends RemoteClientEvent {
    static eventName = "remote.disconnect" as const;
    eventName = "remote.disconnect" as const;

    reason: DisconnectReason;
    message: string;

    constructor(
        server: SkeldjsServer,
        remote: RemoteClient,
        reason: DisconnectReason,
        message?: string
    ) {
        super(server, remote);

        this.reason = reason;
        this.message = message;
    }
}
