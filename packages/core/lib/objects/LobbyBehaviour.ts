import { HazelBuffer, HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";
import { SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { NetworkedObject, NetworkedObjectEvents, NetworkedObjectConstructor } from "../NetworkedObject";
import { StatefulRoom } from "../StatefulRoom";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface LobbyBehaviourData { }

export type LobbyBehaviourEvents<RoomType extends StatefulRoom = StatefulRoom> = NetworkedObjectEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a room object for the Lobby map.
 *
 * See {@link LobbyBehaviourEvents} for events to listen to.
 */
export class LobbyBehaviour<RoomType extends StatefulRoom = StatefulRoom> extends NetworkedObject<
    LobbyBehaviourData,
    LobbyBehaviourEvents,
    RoomType
> {
    static spawnPositions = [
        new Vector2(-1.6, 2.4),
        new Vector2(-1.3, 2.5),
        new Vector2(-1.1, 2.5),
        new Vector2(-0.8, 2.6),
        new Vector2(-0.6, 2.7),
        new Vector2(0.7, 2.8),
        new Vector2(0.9, 2.6),
        new Vector2(1.1, 2.6),
        new Vector2(1.4, 2.5),
        new Vector2(1.7, 2.4),
    ];

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
        data?: HazelBuffer | LobbyBehaviourData
    ) {
        super(room, spawnType, netId, ownerId, flags, data);
    }

    get owner() {
        return super.owner as RoomType;
    }
    
    deserializeFromReader(reader: HazelReader, spawn: boolean): void {
        void reader, spawn;
    }

    serializeToWriter(writer: HazelWriter, spawn: boolean): boolean {
        return false;
    }
}
