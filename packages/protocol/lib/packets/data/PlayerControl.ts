import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "./BaseDataMessage";

export class PlayerControlDataMessage extends BaseDataMessage {
    constructor(public readonly playerId: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): PlayerControlDataMessage {
        const playerId = reader.uint8();
        return new PlayerControlDataMessage(playerId);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.playerId);
    }

    clone(): PlayerControlDataMessage {
        return new PlayerControlDataMessage(this.playerId);
    }
}

export class PlayerControlSpawnDataMessage extends BaseDataMessage {
    constructor(public readonly isNew: boolean, public readonly playerId: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): PlayerControlSpawnDataMessage {
        const isNew = reader.bool();
        const playerId = reader.uint8();
        return new PlayerControlSpawnDataMessage(isNew, playerId);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.bool(this.isNew);
        writer.uint8(this.playerId);
    }

    clone(): PlayerControlSpawnDataMessage {
        return new PlayerControlSpawnDataMessage(this.isNew, this.playerId);
    }
}