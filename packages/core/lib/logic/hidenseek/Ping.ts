import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekPingLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekPingLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekPingLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicPingsHnS.cs)
}
