import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekPingLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekPingLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekPingLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicPingsHnS.cs)
}
