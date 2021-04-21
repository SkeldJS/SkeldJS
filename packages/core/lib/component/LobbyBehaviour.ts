import { HazelBuffer } from "@skeldjs/util";

import { SpawnType } from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { Heritable } from "../Heritable";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface LobbyBehaviourData {}

export interface LobbyBehaviourEvents extends NetworkableEvents {}

/**
 * Represents a room object for the Lobby map.
 *
 * See {@link LobbyBehaviourEvents} for events to listen to.
 */
export class LobbyBehaviour extends Networkable<
    LobbyBehaviourData,
    LobbyBehaviourEvents
> {
    static type = SpawnType.LobbyBehaviour as const;
    type = SpawnType.LobbyBehaviour as const;

    static classname = "LobbyBehaviour" as const;
    classname = "LobbyBehaviour" as const;

    constructor(
        room: Hostable<any>,
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