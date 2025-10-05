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

    static deserializeFromReader(reader: HazelReader) {
        const options = reader.read(GameSettings, true);
        return new SyncSettingsMessage(options);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.write(this.settings, true, 10);
    }

    clone() {
        return new SyncSettingsMessage(this.settings.clone());
    }
}
