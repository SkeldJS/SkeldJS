import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekRoleSelectionLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekRoleSelectionLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekRoleSelectionLogicComponentEvents, RoomType> {
    // TODO: Implement (LogicRoleSelectionHnS.cs)
}
