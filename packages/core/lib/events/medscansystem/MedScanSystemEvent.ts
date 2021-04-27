import { Hostable } from "../../Hostable";
import { MedScanSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class MedScanSystemEvent extends RoomEvent {
    system: MedScanSystem;

    constructor(room: Hostable, system: MedScanSystem) {
        super(room);

        this.system = system;
    }
}
