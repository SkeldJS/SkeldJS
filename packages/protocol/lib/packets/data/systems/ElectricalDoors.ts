import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class ElectricalDoorsSystemDataMessage extends BaseDataMessage {
    constructor(public readonly openDoors: number[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): ElectricalDoorsSystemDataMessage {
        const message = new ElectricalDoorsSystemDataMessage([]);
        const mask = reader.upacked();
        for (let i = 0; i < 32; i++) { // 32 for integer size, also probably maximum amount of doors
            if (mask & (1 << i)) {
                message.openDoors.push(i);
            }
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        var mask: number = 0;
        for (const doorState of this.openDoors) {
            mask |= (1 << doorState);
        }
        writer.upacked(mask);
    }

    clone(): ElectricalDoorsSystemDataMessage {
        return new ElectricalDoorsSystemDataMessage([...this.openDoors]);
    }
}