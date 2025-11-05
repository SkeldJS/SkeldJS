import { ElectricalDoorsSystemDataMessage } from "@skeldjs/au-protocol";
import { DoorsSystem, ElectricalDoorsSystem } from "../../../systems";
import { StatefulRoom } from "../../../StatefulRoom";

export interface ElectricalDoorsSystemEvent<RoomType extends StatefulRoom> {
    system: ElectricalDoorsSystem<RoomType>;
    originMessage: ElectricalDoorsSystemDataMessage|null;
}