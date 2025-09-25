import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalUsablesLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalUsablesLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<NormalUsablesLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicUsablesBasic.cs)
}
