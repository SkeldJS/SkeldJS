import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class MovingPlatformSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly isSpawn: boolean,
        public readonly sequenceId: number,
        public readonly targetId: number|null,
        public readonly side: number,
    ) {
        super();
    }

    static deserializeFromReaderState(reader: HazelReader, isSpawn: boolean): MovingPlatformSystemDataMessage {
        const sequenceId = reader.uint8();
        const targetId = reader.uint32();
        const side = reader.uint8();
        return new MovingPlatformSystemDataMessage(isSpawn, sequenceId, targetId === 255 ? null : targetId, side);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.sequenceId);
        writer.uint32(this.targetId ?? 255);
        writer.uint8(this.side);
    }

    clone(): MovingPlatformSystemDataMessage {
        return new MovingPlatformSystemDataMessage(this.isSpawn, this.sequenceId, this.targetId, this.side);
    }
}