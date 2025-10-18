import { GameDataMessageTag, SpawnType } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseGameDataMessage } from "./BaseGameDataMessage";
import { BaseDataMessage, UnknownDataMessage } from "../data";

export class ComponentSpawnData {
    constructor(public readonly netId: number, public readonly data: BaseDataMessage) {}

    static deserializeFromReader(reader: HazelReader) {
        const netId = reader.upacked();
        const [, dataReader] = reader.message();

        return new ComponentSpawnData(netId, UnknownDataMessage.deserializeFromReader(dataReader));
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.begin(1);
        writer.write(this.data);
        writer.end();
    }

    clone() {
        return new ComponentSpawnData(this.netId, this.data.clone());
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
