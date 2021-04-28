import { Hostable } from "../../Hostable";
import { AutoDoorsSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class AutoDoorsSystemEvent extends RoomEvent {
    /**
     * The automatic doors system in question.
     */
    system: AutoDoorsSystem;

    constructor(room: Hostable<any>, system: AutoDoorsSystem) {
        super(room);

        this.system = system;
    }
}
