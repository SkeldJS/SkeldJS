import { TypedEmitter, TypedEvents } from "@skeldjs/util";

import { Networkable } from "./Networkable";
import { Room } from "./Room";

type NetworkableConstructor<T> = {
    new (room: Room, netid: number, ownerid: number): T;
    classname: string;
};

type HeritableEvents = {

}

// eslint-disable-next-line @typescript-eslint/ban-types
export class Heritable<T extends TypedEvents = {}> extends TypedEmitter<T & HeritableEvents> {
    room: Room;

    id: number;
    components: Networkable[];

    constructor(room: Room, id: number) {
        super();

        this.id = id;

        this.room = room;
        this.components = [];
    }

    emit(event: string, ...args: any[]): boolean {
        this.room.emit(event, ...args);
        
        return super.emit(event, ...args);
    }

    getComponent<T extends Networkable>(ctr: NetworkableConstructor<T>|NetworkableConstructor<T>[]|number): T {
        if (typeof ctr == "number") {
            return this.components.find(component => component && component.netid === ctr) as T;
        }

        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];

            if (Array.isArray(ctr)) {
                if (component && ctr.some(con => component.classname === con.classname)) {
                    return component as T;
                }
            } else {
                if (component && component.classname === ctr.classname) {
                    return component as T;
                }
            }
        }

        return null;
    }
}
