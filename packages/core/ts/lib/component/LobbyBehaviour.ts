import { HazelBuffer } from "@skeldjs/util";

import { SpawnID } from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { Heritable } from "../Heritable";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface LobbyBehaviourData {}

export type LobbyBehaviourEvents = NetworkableEvents & {};

export class LobbyBehaviour extends Networkable<LobbyBehaviourData, LobbyBehaviourEvents> {
    static type = SpawnID.LobbyBehaviour as const;
    type = SpawnID.LobbyBehaviour as const;

    static classname = "LobbyBehaviour" as const;
    classname = "LobbyBehaviour" as const;

    constructor(
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | LobbyBehaviourData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Heritable;
    }
}
