import { ShipStatus } from "../../objects";
import { StatefulRoom } from "../../StatefulRoom";

export interface ShipStatusEvent<RoomType extends StatefulRoom> {
    shipStatus: ShipStatus<RoomType>;
}