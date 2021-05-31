import { AutoDoorsSystem, DoorsSystem, ElectricalDoorsSystem } from "../../system";

export interface DoorsEvent {
    /**
     * The door system that the door is in.
     */
    doorsystem: AutoDoorsSystem|DoorsSystem|ElectricalDoorsSystem;
}
