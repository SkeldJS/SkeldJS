import { Hostable } from "../../Hostable";
import { HudOverrideSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class HudSystemEvent extends RoomEvent {
    system: HudOverrideSystem;

    constructor(room: Hostable, system: HudOverrideSystem) {
        super(room);

        this.system = system;
    }
}
