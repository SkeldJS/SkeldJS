import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class HqHudSystemEvent extends RoomEvent {
    system: HqHudSystem;

    constructor(room: Hostable<any>, system: HqHudSystem) {
        super(room);

        this.system = system;
    }
}
