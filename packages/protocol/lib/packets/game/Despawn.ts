import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class DespawnMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Despawn as const;
    messageTag = GameDataMessageTag.Despawn as const;

    readonly netId: number;

    constructor(netId: number) {
        super();

        this.netId = netId;
    }

    static Deserialize(reader: HazelReader) {
        const netId = reader.upacked();

        return new DespawnMessage(netId);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.netId);
    }

    clone() {
        return new DespawnMessage(this.netId);
    }
}
