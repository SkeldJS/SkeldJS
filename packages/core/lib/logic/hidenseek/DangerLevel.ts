import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekDangerLevelLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekDangerLevelLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekDangerLevelLogicComponentEvents, RoomType> {
    // TODO: Implement (LogicHnSDangerLevel.cs)
}
