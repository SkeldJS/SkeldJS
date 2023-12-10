import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekDeathPopupLevelLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekDeathPopupLevelLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekDeathPopupLevelLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicHnSDeathPopup.cs)
}
