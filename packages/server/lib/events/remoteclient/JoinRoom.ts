import { RemoteClient } from "../../RemoteClient";
import { Room } from "../../Room";
import { SkeldjsServer } from "../../server";
import { RemoteClientEvent } from "./RemoteClientEvent";

export class RemoteClientJoinRoomEvent extends RemoteClientEvent {
    static eventName = "remote.joinroom" as const;
    eventName = "remote.joinroom" as const;

    code: number;
    found: Room;

    constructor(
        server: SkeldjsServer,
        remote: RemoteClient,
        code: number,
        found: Room
    ) {
        super(server, remote);

        this.code = code;
        this.found = found;
    }
}
