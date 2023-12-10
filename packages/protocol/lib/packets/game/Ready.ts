import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class ReadyMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Ready as const;
    messageTag = GameDataMessageTag.Ready as const;

    readonly clientId: number;

    constructor(clientId: number) {
        super();

        this.clientId = clientId;
    }

    static Deserialize(reader: HazelReader) {
        const clientId = reader.packed();
        return new ReadyMessage(clientId);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.clientId);
    }

    clone() {
        return new ReadyMessage(this.clientId);
    }
}
