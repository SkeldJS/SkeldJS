import { SystemType } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum VentilationState {
    CrewmateOpen,
    CrewmateClose,
    ImpostorEnter,
    ImpostorExit,
    ImpostorMove,
    CrewmateKick
}

export class VentilationSystemMessage extends BaseSystemMessage {
    static messageTag = SystemType.Ventilation;

    constructor(
        public readonly sequenceId: number,
        public readonly state: VentilationState,
        public readonly ventId: number
    ) {
        super(VentilationSystemMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const sequenceId = reader.uint16();
        const state = reader.uint8();
        const ventId = reader.packed();

        return new VentilationSystemMessage(sequenceId, state, ventId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.sequenceId);
        writer.uint8(this.state);
        writer.packed(this.ventId);
    }

    clone() {
        return new VentilationSystemMessage(this.sequenceId, this.state, this.ventId);
    }
}
