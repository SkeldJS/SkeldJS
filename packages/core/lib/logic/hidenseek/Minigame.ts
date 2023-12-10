import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekMinigameLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekMinigameLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekMinigameLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMinigameHnS.cs)
}
