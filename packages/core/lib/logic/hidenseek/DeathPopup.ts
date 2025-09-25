import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekDeathPopupLevelLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekDeathPopupLevelLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekDeathPopupLevelLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicHnSDeathPopup.cs)
}
