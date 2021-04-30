import { Hostable } from "../../Hostable";
import { ElectricalDoorsSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class ElectricalDoorsSystemEvent extends RoomEvent {
    /**
     * The electrical doors system in question.
     */
    system: ElectricalDoorsSystem;

    constructor(room: Hostable<any>, system: ElectricalDoorsSystem) {
        super(room);

        this.system = system;
    }
}
