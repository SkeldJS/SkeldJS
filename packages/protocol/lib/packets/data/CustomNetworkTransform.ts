import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/hazel";
import { BaseDataMessage } from "./BaseDataMessage";

export class CustomNetworkTransformDataMessage extends BaseDataMessage {
    constructor(public readonly sequenceId: number, public readonly positions: Vector2[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): CustomNetworkTransformDataMessage {
        const sequenceId = reader.uint16();
        const positions = reader.list(r => r.vector());
        return new CustomNetworkTransformDataMessage(sequenceId, positions);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.uint16(this.sequenceId);
        writer.list(true, this.positions, vec => writer.vector(vec));
    }

    clone(): CustomNetworkTransformDataMessage {
        return new CustomNetworkTransformDataMessage(this.sequenceId, [...this.positions]);
    }
}

export class CustomNetworkTransformSpawnDataMessage extends BaseDataMessage {
    constructor(public readonly sequenceId: number, public readonly position: Vector2) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): CustomNetworkTransformSpawnDataMessage {
        const sequenceId = reader.uint16();
        const position = reader.vector();
        return new CustomNetworkTransformSpawnDataMessage(sequenceId, position);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.uint16(this.sequenceId);
        writer.vector(this.position);
    }

    clone(): CustomNetworkTransformSpawnDataMessage {
        return new CustomNetworkTransformSpawnDataMessage(this.sequenceId, this.position);
    }
}