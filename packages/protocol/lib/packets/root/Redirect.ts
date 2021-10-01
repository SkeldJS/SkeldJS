import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class RedirectMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.Redirect as const;
    messageTag = RootMessageTag.Redirect as const;

    readonly ip: string;
    readonly port: number;

    constructor(ip: string, port: number) {
        super();

        this.ip = ip;
        this.port = port;
    }

    static Deserialize(reader: HazelReader) {
        const ip = reader.bytes(4).buffer.join(".");
        const port = reader.uint16();

        return new RedirectMessage(ip, port);
    }

    Serialize(writer: HazelWriter) {
        const split = this.ip.split(".");
        for (const part of split) {
            writer.uint8(parseInt(part));
        }
        writer.uint16(this.port);
    }

    clone() {
        return new RedirectMessage(this.ip, this.port);
    }
}
