import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseReactorMessage } from "./BaseReactorMessage";
import { ReactorMessageTag } from "./ReactorMessage";

export class ReactorHandshakeMessage extends BaseReactorMessage {
    static messageTag = ReactorMessageTag.Handshake as const;
    messageTag = ReactorMessageTag.Handshake as const;
    
    servername: string;
    serverver: string;
    plugincount: number;

    constructor(
        servername: string,
        serverver: string,
        plugincount: number
    ) {
        super();

        this.servername = servername;
        this.serverver = serverver;
        this.plugincount = plugincount;
    }

    static Deserialize(reader: HazelReader) {
        const servername = reader.string();
        const serverver = reader.string();
        const plugincount = reader.packed();

        return new ReactorHandshakeMessage(servername, serverver, plugincount);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.servername);
        writer.string(this.serverver);
        writer.packed(this.plugincount);
    }
}