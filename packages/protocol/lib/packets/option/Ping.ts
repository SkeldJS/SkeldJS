import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class PingPacket extends BaseRootPacket {
    static messageTag = SendOption.Ping as const;
    messageTag = SendOption.Ping as const;

    readonly nonce: number;

    constructor(nonce: number) {
        super();

        this.nonce = nonce;
    }

    static Deserialize(reader: HazelReader) {
        const nonce = reader.uint16(true);
        return new PingPacket(nonce);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
    }

    clone() {
        return new PingPacket(this.nonce);
    }
}
