import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";
import { HazelReader } from "@skeldjs/util";

import { Networkable, NetworkableEvents } from "./Networkable";
import { Hostable } from "./Hostable";
import { SpawnType } from "@skeldjs/constant";

export type NetworkableConstructor<T> = {
    new (
        room: Hostable<any>,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | any
    ): T;
}|{
    new (
        room: Hostable<any>,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | any,
        object?: Networkable<any, any>
    ): T;
};

export type HeritableEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a basic identifiable entity with components.
 *
 * See {@link HeritableEvents} for events to listen to.
 */
export class Heritable<
    T extends HeritableEvents = HeritableEvents,
    RoomType extends Hostable = Hostable
> extends EventEmitter<T> {
    /**
     * The room that this object belongs to.
     */
    room: RoomType;

    /**
     * The ID of the object.
     */
    id: number;

    constructor(room: RoomType, id: number) {
        super();

        this.id = id;

        this.room = room;
    }

    async emit<Event extends HeritableEvents[keyof HeritableEvents]>(
        event: Event
    ): Promise<Event>;
    async emit<Event extends BasicEvent>(event: Event): Promise<Event>;
    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        if ((this.room as Heritable<any>) !== this) this.room.emit(event);

        return super.emit(event);
    }
}
