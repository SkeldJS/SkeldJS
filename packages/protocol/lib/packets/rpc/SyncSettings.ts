import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { GameSettings } from "../../misc";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SyncSettingsMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SyncSettings;

    constructor(public readonly settings: GameSettings) {
        super(SyncSettingsMessage.messageTag);
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
