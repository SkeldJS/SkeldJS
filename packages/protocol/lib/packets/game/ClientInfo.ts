import { GameDataMessageTag, RuntimePlatform } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class ClientInfoMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.ClientInfo as const;
    messageTag = GameDataMessageTag.ClientInfo as const;

    readonly clientId: number;
    readonly platform: RuntimePlatform;

    constructor(clientId: number, platform: RuntimePlatform) {
        super();

        this.clientId = clientId;
        this.platform = platform;
    }

    static Deserialize(reader: HazelReader) {
        const clientId = reader.packed();
        const platform = reader.upacked();

        return new ClientInfoMessage(clientId, platform);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.clientId);
        writer.upacked(this.platform);
    }

    clone() {
        return new ClientInfoMessage(this.clientId, this.platform);
    }
}
