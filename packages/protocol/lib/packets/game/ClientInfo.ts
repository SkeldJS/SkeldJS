import { GameDataMessageTag, RuntimePlatform } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class ClientInfoMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.ClientInfo;

    constructor(public readonly clientId: number, public readonly platform: RuntimePlatform) {
        super(ClientInfoMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const clientId = reader.packed();
        const platform = reader.upacked();
        return new ClientInfoMessage(clientId, platform);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.clientId);
        writer.upacked(this.platform);
    }

    clone() {
        return new ClientInfoMessage(this.clientId, this.platform);
    }
}
