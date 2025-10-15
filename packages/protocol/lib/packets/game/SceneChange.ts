import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class SceneChangeMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.SceneChange;

    constructor(public readonly clientId: number, public readonly scene: string) {
        super(SceneChangeMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const clientId = reader.packed();
        const scene = reader.string();
        return new SceneChangeMessage(clientId, scene);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.clientId);
        writer.string(this.scene);
    }

    clone() {
        return new SceneChangeMessage(this.clientId, this.scene);
    }
}
