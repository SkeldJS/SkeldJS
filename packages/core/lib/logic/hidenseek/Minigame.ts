import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekMinigameLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekMinigameLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekMinigameLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMinigameHnS.cs)
}
