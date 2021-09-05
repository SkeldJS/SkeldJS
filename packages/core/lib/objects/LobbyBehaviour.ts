import { HazelBuffer } from "@skeldjs/util";
import { SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents, NetworkableConstructor } from "../Networkable";
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
    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelBuffer | LobbyBehaviourData
    ) {
        super(room, spawnType, netid, ownerid, flags, data);
    }

    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        if (component === LobbyBehaviour as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }
        
        return super.getComponent(component);
    }

    get owner() {
        return super.owner as RoomType;
    }
}
