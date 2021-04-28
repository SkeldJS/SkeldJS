import { Hostable } from "../../Hostable";
import { MedScanSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class MedScanSystemEvent extends RoomEvent {
    /**
     * The medical scan system in question.
     */
    system: MedScanSystem;

    constructor(room: Hostable<any>, system: MedScanSystem) {
        super(room);

        this.system = system;
    }
}
