import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class SceneChangeMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.SceneChange as const;
    messageTag = GameDataMessageTag.SceneChange as const;

    readonly clientId: number;
    readonly scene: string;

    constructor(clientId: number, scene: string) {
        super();

        this.clientId = clientId;
        this.scene = scene;
    }

    static Deserialize(reader: HazelReader) {
        const clientId = reader.packed();
        const scene = reader.string();

        return new SceneChangeMessage(clientId, scene);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.clientId);
        writer.string(this.scene);
    }

    clone() {
        return new SceneChangeMessage(this.clientId, this.scene);
    }
}
