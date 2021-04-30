import { Hostable } from "../../Hostable";
import { HudOverrideSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class HudSystemEvent extends RoomEvent {
    /**
     * The communications system in question.
     */
    system: HudOverrideSystem;

    constructor(room: Hostable<any>, system: HudOverrideSystem) {
        super(room);

        this.system = system;
    }
}
