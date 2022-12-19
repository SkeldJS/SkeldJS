import { HazelBuffer } from "@skeldjs/util";
import { SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface InnerGameManagerData {}

export type InnerGameManagerEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> & ExtractEventTypes<[]>;

export abstract class InnerGameManager<RoomType extends Hostable = Hostable> extends Networkable<
    InnerGameManagerData,
    InnerGameManagerEvents<RoomType>,
    RoomType
> {
    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerid: number,
        flags: number,
        data?: HazelBuffer | InnerGameManagerData
    ) {
        super(room, spawnType, netId, ownerid, flags, data);
    }

    get owner() {
        return super.owner as RoomType;
    }

    // TODO: Implement (GameManager.cs)
}
