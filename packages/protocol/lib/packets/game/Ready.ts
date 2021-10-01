import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class ReadyMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Ready as const;
    messageTag = GameDataMessageTag.Ready as const;

    readonly clientid: number;

    constructor(clientid: number) {
        super();

        this.clientid = clientid;
    }

    static Deserialize(reader: HazelReader) {
        const clientid = reader.packed();

        return new ReadyMessage(clientid);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.clientid);
    }

    clone() {
        return new ReadyMessage(this.clientid);
    }
}
