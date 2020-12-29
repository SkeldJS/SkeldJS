import { HazelBuffer } from "@skeldjs/util";

import { SpawnID } from "@skeldjs/constant";

import { Networkable } from "../Networkable"
import { Global } from "../Global";
import { Room } from "../Room";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface LobbyBehaviourData {

}

export class LobbyBehaviour extends Networkable<Global> {
    static type = SpawnID.LobbyBehaviour;
    type = SpawnID.LobbyBehaviour;

    static classname = "LobbyBehaviour";
    classname = "LobbyBehaviour";

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|LobbyBehaviourData) {
        super(room, netid, ownerid, data);
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {

    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {

    }
}