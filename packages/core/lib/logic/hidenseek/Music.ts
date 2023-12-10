import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekMusicLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekMusicLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekMusicLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMusicHnS.cs)
}
