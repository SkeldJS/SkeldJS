import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class DespawnMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Despawn;

    constructor(public readonly netId: number) {
        super(DespawnMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const netId = reader.upacked();
        return new DespawnMessage(netId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.netId);
    }

    clone() {
        return new DespawnMessage(this.netId);
    }
}
