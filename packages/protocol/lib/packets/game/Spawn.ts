import { GameDataMessageTag, SpawnType } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseGameDataMessage } from "./BaseGameDataMessage";
import { BaseDataMessage, UnknownDataMessage } from "../data";

export class ComponentSpawnData {
    constructor(public readonly netId: number, public readonly data: BaseDataMessage|null) {}

    static deserializeFromReader(reader: HazelReader) {
        const netId = reader.upacked();
        const [, dataReader] = reader.message();

        if (dataReader.left === 0) return new ComponentSpawnData(netId, null);
        return new ComponentSpawnData(netId, new UnknownDataMessage(HazelReader.from(dataReader)));
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.begin(1);
        if (this.data) {
            writer.write(this.data);
        }
        writer.end();
    }

    clone() {
        return new ComponentSpawnData(this.netId, this.data ? this.data.clone() : null);
    }
}

export class SpawnMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Spawn;

    constructor(
        public readonly spawnType: SpawnType,
        public readonly ownerId: number,
        public readonly flags: number,
        public readonly components: ComponentSpawnData[]
    ) {
        super(SpawnMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const spawnType = reader.upacked();
        const ownerId = reader.packed();
        const flags = reader.uint8();
        const num = reader.upacked();
        const components = reader.lread(num, ComponentSpawnData);
        return new SpawnMessage(spawnType, ownerId, flags, components);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.spawnType);
        writer.packed(this.ownerId);
        writer.uint8(this.flags);
        writer.lwrite(true, this.components);
    }

    clone() {
        return new SpawnMessage(this.spawnType, this.ownerId, this.flags, this.components.map(component => component.clone()));
    }
}
