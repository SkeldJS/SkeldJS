import { EventEmitter } from "events";

import { Networkable } from "./Networkable";
import { Room } from "./Room";

export class Heritable extends EventEmitter {
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
        this.room.emit(event, this, ...args);
        
        return super.emit(event, ...args);
    }

    getComponent<T extends Networkable>(ctr: {
        new (room: Room, netid: number, ownerid: number): T;
        classname: string;
    }|number): T {
        if (typeof ctr == "number") {
            return this.components.find(component => component && component.netid === ctr) as T;
        }

        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            
            if (component && component.classname === ctr.classname) {
                return component as T;
            }
        }

        return null;
    }
}
