import { AutoDoorsSystem, DoorsSystem, ElectricalDoorsSystem } from "../../systems";

export interface DoorsEvent {
    /**
     * The door system that the door is in.
     */
    doorsystem: AutoDoorsSystem|DoorsSystem|ElectricalDoorsSystem;
}
