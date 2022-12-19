import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalOptionsLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalOptionsLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<NormalOptionsLogicComponentEvents, RoomType> {
    // TODO: Implement (LogicOptionsNormal.cs)
}
