import { StatefulRoom } from "../../StatefulRoom";
import { MedScanSystem } from "../../systems/MedScanSystem";
import { RoomEvent } from "../RoomEvent";

export interface MedScanEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The med scan system that this event is for.
     */
    medscan: MedScanSystem<RoomType>;
}
