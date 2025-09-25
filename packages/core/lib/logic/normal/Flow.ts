import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalFlowLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalFlowLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<NormalFlowLogicComponentEvents, RoomType> {
    // game ending is done inline for performance reasons
}
