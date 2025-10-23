import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class HudOverrideSystemDataMessage extends BaseDataMessage {
    constructor(public readonly hudOverridden: boolean) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): HudOverrideSystemDataMessage {
        const isSabotaged = reader.bool();
        return new HudOverrideSystemDataMessage(isSabotaged);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.bool(this.hudOverridden);
    }

    clone(): HudOverrideSystemDataMessage {
        return new HudOverrideSystemDataMessage(this.hudOverridden);
    }
}