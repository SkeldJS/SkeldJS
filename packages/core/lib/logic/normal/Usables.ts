import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalUsablesLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalUsablesLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<NormalUsablesLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicUsablesBasic.cs)
}
