import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekUsablesLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekUsablesLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekUsablesLogicComponentEvents, RoomType> {
    // TODO: Implement (LogicUsablesHnS.cs)
}
