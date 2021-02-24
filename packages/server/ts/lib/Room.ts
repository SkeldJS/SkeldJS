import {
    Hostable
} from "@skeldjs/core";

import { RoomConfig } from "./interface/RoomConfig";
import { RemoteClient } from "./RemoteClient";

export type RoomEvents = {

}

export class Room extends Hostable<RoomEvents> {
    remotes: Map<number, RemoteClient>;

    constructor(public options: RoomConfig) {
        super();
    }

    get me() {
        return null;
    }

    get amhost() {
        return this.options.SaaH;
    }
}
