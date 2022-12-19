import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalRoleSelectionLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalRoleSelectionLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<NormalRoleSelectionLogicComponentEvents, RoomType> {
    // TODO: Implement (LogicRoleSelectionNormal.cs)
}
