import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class SabotageSystemDataMessage extends BaseDataMessage {
    constructor(public readonly cooldown: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): SabotageSystemDataMessage {
        const cooldown = reader.float();
        return new SabotageSystemDataMessage(cooldown);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.float(this.cooldown);
    }

    clone(): SabotageSystemDataMessage {
        return new SabotageSystemDataMessage(this.cooldown);
    }
}