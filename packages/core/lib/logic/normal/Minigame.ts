import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalMinigameLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalMinigameLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<NormalMinigameLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMinigame.cs, no file for normal gamemode logic)
}
