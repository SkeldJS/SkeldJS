import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalMinigameLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalMinigameLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<NormalMinigameLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMinigame.cs, no file for normal gamemode logic)
}
