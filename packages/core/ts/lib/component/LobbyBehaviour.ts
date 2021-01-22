import { HazelBuffer } from "@skeldjs/util";

import { SpawnID } from "@skeldjs/constant";

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { Room } from "../Room";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface LobbyBehaviourData {

}

export type LobbyBehaviourEvents = {

}

export class LobbyBehaviour extends Networkable<LobbyBehaviourEvents> {
    static type = SpawnID.LobbyBehaviour as const;
    type = SpawnID.LobbyBehaviour as const;

    static classname = "LobbyBehaviour" as const;
    classname = "LobbyBehaviour" as const;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|LobbyBehaviourData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Global;
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {

    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {

    }
}