import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekUsablesLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekUsablesLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekUsablesLogicComponentEvents, RoomType> {
    // TODO: Implement (LogicUsablesHnS.cs)
}
