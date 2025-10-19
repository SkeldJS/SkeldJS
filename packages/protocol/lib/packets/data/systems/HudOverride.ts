import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class HudOverrideSystemDataMessage extends BaseDataMessage {
    constructor(public readonly isSabotaged: boolean) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): HudOverrideSystemDataMessage {
        const isSabotaged = reader.bool();
        return new HudOverrideSystemDataMessage(isSabotaged);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.bool(this.isSabotaged);
    }

    clone(): HudOverrideSystemDataMessage {
        return new HudOverrideSystemDataMessage(this.isSabotaged);
    }
}