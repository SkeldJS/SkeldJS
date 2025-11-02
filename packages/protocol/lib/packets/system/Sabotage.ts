import { SystemType } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export class SabotageSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly systemType: SystemType,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const systemType = reader.uint8();

        return new SabotageSystemMessage(systemType);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.systemType);
    }

    clone() {
        return new SabotageSystemMessage(this.systemType);
    }
}
