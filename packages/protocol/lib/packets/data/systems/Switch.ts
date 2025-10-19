import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class SwitchSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly expectedBitfield: number,
        public readonly actualBitfield: number,
        public readonly brightness: number,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): SwitchSystemDataMessage {
        const expected = reader.uint8();
        const actual = reader.uint8();
        const brightness = reader.uint8();
        return new SwitchSystemDataMessage(expected, actual, brightness);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.expectedBitfield);
        writer.uint8(this.actualBitfield);
        writer.uint8(this.brightness);
    }

    clone(): SwitchSystemDataMessage {
        return new SwitchSystemDataMessage(this.expectedBitfield, this.actualBitfield, this.brightness);
    }
}