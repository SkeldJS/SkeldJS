import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { GameSettings } from "../../misc";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SyncSettingsMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SyncSettings as const;
    messageTag = RpcMessageTag.SyncSettings as const;

    settings: GameSettings;

    constructor(options: GameSettings) {
        super();

        this.settings = options;
    }

    static Deserialize(reader: HazelReader) {
        const options = reader.read(GameSettings);

        return new SyncSettingsMessage(options);
    }

    Serialize(writer: HazelWriter) {
        writer.write(this.settings);
    }

    clone() {
        return new SyncSettingsMessage(this.settings.clone());
    }
}
