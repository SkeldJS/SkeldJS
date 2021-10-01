import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class SceneChangeMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.SceneChange as const;
    messageTag = GameDataMessageTag.SceneChange as const;

    readonly clientid: number;
    readonly scene: string;

    constructor(clientid: number, scene: string) {
        super();

        this.clientid = clientid;
        this.scene = scene;
    }

    static Deserialize(reader: HazelReader) {
        const clientid = reader.packed();
        const scene = reader.string();

        return new SceneChangeMessage(clientid, scene);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.clientid);
        writer.string(this.scene);
    }

    clone() {
        return new SceneChangeMessage(this.clientid, this.scene);
    }
}
