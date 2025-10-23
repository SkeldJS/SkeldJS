import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class PlayerVentDataMessage extends BaseDataMessage {
    constructor(public readonly playerId: number, public readonly ventId: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): PlayerVentDataMessage {
        const playerId = reader.uint8();
        const ventId = reader.uint8();
        return new PlayerVentDataMessage(playerId, ventId);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.playerId);
        writer.uint8(this.ventId);
    }

    clone(): PlayerVentDataMessage {
        return new PlayerVentDataMessage(this.playerId, this.ventId);
    }
}

export class VentilationSystemDataMessage extends BaseDataMessage {
    constructor(public readonly cleaningVents: PlayerVentDataMessage[], public readonly insideVents: PlayerVentDataMessage[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): VentilationSystemDataMessage {
        const message = new VentilationSystemDataMessage([], []);
        const numCleaning = reader.packed();
        for (let i = 0; i < numCleaning; i++) {
            message.cleaningVents.push(PlayerVentDataMessage.deserializeFromReader(reader));
        }
        const numInside = reader.packed();
        for (let i = 0; i < numInside; i++) {
            message.insideVents.push(PlayerVentDataMessage.deserializeFromReader(reader));
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.packed(this.cleaningVents.length);
        for (const cleaningVent of this.cleaningVents) {
            cleaningVent.serializeToWriter(writer);
        }
        writer.packed(this.insideVents.length);
        for (const insideVent of this.insideVents) {
            insideVent.serializeToWriter(writer);
        }
    }

    clone(): VentilationSystemDataMessage {
        return new VentilationSystemDataMessage(this.cleaningVents.map(x => x.clone()), this.insideVents.map(x => x.clone()));
    }
}