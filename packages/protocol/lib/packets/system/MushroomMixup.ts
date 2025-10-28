import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum MushroomMixupOperation {
    Nothing,
    Sabotage,
}

export class MushroomMixupSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly operation: MushroomMixupOperation,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const triggerSabotage = reader.uint8();
        return new MushroomMixupSystemMessage(triggerSabotage);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.operation);
    }

    clone() {
        return new MushroomMixupSystemMessage(this.operation);
    }
}
