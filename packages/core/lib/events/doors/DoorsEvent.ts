import { AutoDoorsSystem, DoorsSystem, ElectricalDoorsSystem } from "../../system";

export interface DoorsEvent {
    doorsystem: AutoDoorsSystem|DoorsSystem|ElectricalDoorsSystem;
}
