import { DeconState } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseDataMessage } from "../BaseDataMessage";

export class DeconSystemDataMessage extends BaseDataMessage {
    constructor(public readonly timer: number, public readonly state: DeconState) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): DeconSystemDataMessage {
        const timer = reader.uint8();
        const state = reader.uint8();
        return new DeconSystemDataMessage(timer, state);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(Math.ceil(this.timer));
        writer.uint8(this.state);
    }

    clone(): DeconSystemDataMessage {
        return new DeconSystemDataMessage(this.timer, this.state);
    }
}