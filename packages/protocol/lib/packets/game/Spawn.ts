import { GameDataMessageTag, SpawnFlag, SpawnType } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { ComponentSpawnData } from "../../misc";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class SpawnMessage extends BaseGameDataMessage {
    static tag = GameDataMessageTag.Spawn as const;
    tag = GameDataMessageTag.Spawn as const;

    readonly spawnType: SpawnType;
    readonly ownerid: number;
    readonly flags: SpawnFlag;
    readonly components: ComponentSpawnData[];

    constructor(
        spawnType: SpawnType,
        ownerid: number,
        flags: SpawnFlag,
        components: ComponentSpawnData[]
    ) {
        super();

        this.spawnType = spawnType;
        this.ownerid = ownerid;
        this.flags = flags;
        this.components = components;
    }

    static Deserialize(reader: HazelReader) {
        const spawnType = reader.upacked();
        const ownerid = reader.packed();
        const flags = reader.uint8();
        const num_components = reader.upacked();
        const components = reader.lread(num_components, ComponentSpawnData);

        return new SpawnMessage(spawnType, ownerid, flags, components);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.spawnType);
        writer.packed(this.ownerid);
        writer.uint8(this.flags);
        writer.lwrite(true, this.components);
    }
}
