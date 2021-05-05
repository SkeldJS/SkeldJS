import { EventEmitter, ExtractEventTypes } from "@skeldjs/events";
import { HazelReader } from "@skeldjs/util";

import { Networkable, NetworkableEvents } from "./Networkable";
import { Hostable } from "./Hostable";

type NetworkableConstructor<T> = {
    new (
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | any
    ): T;
    classname: string;
};

export type HeritableEvents = NetworkableEvents & ExtractEventTypes<[]>;

/**
 * Represents a basic identifiable entity with components.
 *
 * See {@link HeritableEvents} for events to listen to.
 */
export class Heritable<
    T extends HeritableEvents = HeritableEvents
> extends EventEmitter<T> {
    /**
     * The room that this object belongs to.
     */
    room: Hostable<any>;

    /**
     * The ID of the object.
     */
    id: number;

    /**
     * The components for this object.
     */
    components: (Networkable<any, any> | null)[];

    constructor(room: Hostable<any>, id: number) {
        super();

        this.id = id;

        this.room = room;
        this.components = [];
    }

    async emit<Event extends HeritableEvents[keyof HeritableEvents]>(
        event: Event
    ): Promise<Event>;
    async emit<Event extends T[keyof T]>(event: Event): Promise<Event>;
    async emit<Event extends T[keyof T]>(event: Event): Promise<Event> {
        if ((this.room as Heritable<any>) !== this) this.room.emit(event);

        return super.emit(event);
    }

    /**
     * Get a certain component from the object.
     * @param component The component class to get.
     */
    getComponent<T>(
        component:
            | NetworkableConstructor<T>
            | NetworkableConstructor<T>[]
            | number
    ): T | null {
        if (typeof component == "number") {
            return (this.components.find(
                (com) => com && com.netid === component
            ) as unknown) as T;
        }

        for (let i = 0; i < this.components.length; i++) {
            const c = this.components[i];

            if (Array.isArray(component)) {
                if (
                    c &&
                    component.some((com) => c.classname === com.classname)
                ) {
                    return (c as unknown) as T;
                }
            } else {
                if (c && c.classname === component.classname) {
                    return (c as unknown) as T;
                }
            }
        }

        return null;
    }
}
