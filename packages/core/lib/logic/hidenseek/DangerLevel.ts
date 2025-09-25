import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekDangerLevelLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekDangerLevelLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekDangerLevelLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicHnSDangerLevel.cs)
}
