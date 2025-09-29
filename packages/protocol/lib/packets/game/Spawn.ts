import { GameDataMessageTag, SpawnType } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { ComponentSpawnData } from "../../misc";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class SpawnMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Spawn as const;
    messageTag = GameDataMessageTag.Spawn as const;

    readonly spawnType: SpawnType;
    readonly ownerId: number;
    readonly flags: number;
    readonly components: ComponentSpawnData[];

    constructor(
        spawnType: SpawnType,
        ownerId: number,
        flags: number,
        components: ComponentSpawnData[]
    ) {
        super();

        this.spawnType = spawnType;
        this.ownerId = ownerId;
        this.flags = flags;
        this.components = components;
    }

    static Deserialize(reader: HazelReader) {
        const spawnType = reader.upacked();
        const ownerId = reader.packed();
        const flags = reader.uint8();
        const num_components = reader.upacked();
        const components = reader.lread(num_components, ComponentSpawnData);

        return new SpawnMessage(spawnType, ownerId, flags, components);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.spawnType);
        writer.packed(this.ownerId);
        writer.uint8(this.flags);
        writer.lwrite(true, this.components);
    }

    clone() {
        return new SpawnMessage(this.spawnType, this.ownerId, this.flags, this.components.map(component => component.clone()));
    }
}
