import { AutoDoorsSystemDataMessage, AutoDoorsSystemSpawnDataMessage } from "@skeldjs/au-protocol";
import { AutoDoorsSystem } from "../../../systems";
import { StatefulRoom } from "../../../StatefulRoom";

export interface AutoDoorsSystemEvent<RoomType extends StatefulRoom> {
    system: AutoDoorsSystem<RoomType>;
    originMessage: AutoDoorsSystemSpawnDataMessage|AutoDoorsSystemDataMessage|null;
}