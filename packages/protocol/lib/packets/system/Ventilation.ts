import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum VentilationOperation {
    StartCleaning,
    StopCleaning,
    Enter,
    Exit,
    Move,
    BootImpostors,
}

export class VentilationSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly sequenceId: number,
        public readonly operation: VentilationOperation,
        public readonly ventId: number
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const sequenceId = reader.uint16();
        const state = reader.uint8();
        const ventId = reader.packed();

        return new VentilationSystemMessage(sequenceId, state, ventId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.sequenceId);
        writer.uint8(this.operation);
        writer.packed(this.ventId);
    }

    clone() {
        return new VentilationSystemMessage(this.sequenceId, this.operation, this.ventId);
    }
}
