import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekOptionsLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekOptionsLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekOptionsLogicComponentEvents, RoomType> {
    // TODO: Implement (LogicOptionsHnS.cs)
}
