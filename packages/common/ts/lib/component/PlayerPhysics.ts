import { HazelBuffer } from "@skeldjs/util";

import { Networkable } from "../Networkable"
import { PlayerData } from "../PlayerData"
import { Room } from "../Room";

import { SpawnID } from "@skeldjs/constant";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {

}

export class PlayerPhysics extends Networkable<PlayerData> {
    static type = SpawnID.Player;
    type = SpawnID.Player;
    
    static classname = "PlayerPhysics";
    classname = "PlayerPhysics";

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|PlayerPhysicsData) {
        super(room, netid, ownerid, data);
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {

    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {

    }
}