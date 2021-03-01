import { EventEmitter } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "./Networkable";
import { Hostable } from "./Hostable";
import { HazelBuffer } from "@skeldjs/util";
import { PropagatedEvents } from "./util/PropagatedEvents";

type NetworkableConstructor<T> = {
    new (room: Hostable, netid: number, ownerid: number, data?: HazelBuffer | any): T;
    classname: string;
};

type HeritableEvents = PropagatedEvents<NetworkableEvents, { component: Networkable }> & {

}

export class Heritable<T extends Record<string, any> = any> extends EventEmitter<T & HeritableEvents> {
    room: Hostable;

    id: number;
    components: Networkable[];

    constructor(room: Hostable, id: number) {
        super();

        this.id = id;

        this.room = room;
        this.components = [];
    }

    // <Name extends string | number | symbol>(eventName: Name, eventData: any) => Promise<void>
    // <Name extends string | number | symbol>(eventName: Name, eventData: any) => Promise<void>
    async emit(...args: any[]) {
        const event = args[0] as string;
        const data = args[1] as any;

        this.room.emit(event, {
            ...data
        });

        return super.emit(event, data);
    }

    getComponent<T>(ctr: NetworkableConstructor<T>|NetworkableConstructor<T>[]|number): T {
        if (typeof ctr == "number") {
            return this.components.find(component => component && component.netid === ctr) as unknown as T;
        }

        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];

            if (Array.isArray(ctr)) {
                if (component && ctr.some(con => component.classname === con.classname)) {
                    return component as unknown as T;
                }
            } else {
                if (component && component.classname === ctr.classname) {
                    return component as unknown as T;
                }
            }
        }

        return null;
    }
}
