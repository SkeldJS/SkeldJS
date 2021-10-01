import { GameDataMessageTag, RuntimePlatform } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class ClientInfoMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.ClientInfo as const;
    messageTag = GameDataMessageTag.ClientInfo as const;

    readonly clientid: number;
    readonly platform: RuntimePlatform;

    constructor(clientid: number, platform: RuntimePlatform) {
        super();

        this.clientid = clientid;
        this.platform = platform;
    }

    static Deserialize(reader: HazelReader) {
        const clientid = reader.packed();
        const platform = reader.upacked();

        return new ClientInfoMessage(clientid, platform);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.clientid);
        writer.upacked(this.platform);
    }

    clone() {
        return new ClientInfoMessage(this.clientid, this.platform);
    }
}
