import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export class HudOverrideSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly hudOverridden: boolean,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const bit = reader.uint8();
        return new HudOverrideSystemMessage((bit & 0x80) !== 0);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.hudOverridden ? 0x80 : 0);
    }

    clone() {
        return new HudOverrideSystemMessage(this.hudOverridden);
    }
}
