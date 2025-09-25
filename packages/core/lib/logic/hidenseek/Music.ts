import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekMusicLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekMusicLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekMusicLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMusicHnS.cs)
}
