import { HazelBuffer } from "@skeldjs/util";
import { SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface LobbyBehaviourData {}

export type LobbyBehaviourEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a room object for the Lobby map.
 *
 * See {@link LobbyBehaviourEvents} for events to listen to.
 */
export class LobbyBehaviour<RoomType extends Hostable = Hostable> extends Networkable<
    LobbyBehaviourData,
    LobbyBehaviourEvents<RoomType>,
    RoomType
> {
    static type = SpawnType.LobbyBehaviour as const;
    type = SpawnType.LobbyBehaviour as const;

    static classname = "LobbyBehaviour" as const;
    classname = "LobbyBehaviour" as const;

    constructor(
        room: RoomType,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | LobbyBehaviourData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as RoomType;
    }
}
