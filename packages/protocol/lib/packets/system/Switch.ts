import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export class SwitchSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly isBitfield: boolean,
        public readonly flipSwitches: number,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const flipState = reader.uint8();

        if (flipState & 0x80) { // sabotage, takes bitfield
            return new SwitchSystemMessage(true, flipState & 0x1f);
        }

        return new SwitchSystemMessage(false, flipState);
    }

    serializeToWriter(writer: HazelWriter) {
        if (this.isBitfield) {
            writer.uint8(this.flipSwitches & 0x80);
        } else {
            writer.uint8(this.flipSwitches);
        }
    }

    clone() {
        return new SwitchSystemMessage(this.isBitfield, this.flipSwitches);
    }
}
