import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalFlowLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalFlowLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<NormalFlowLogicComponentEvents, RoomType> {
    // game ending is done inline for performance reasons
}
