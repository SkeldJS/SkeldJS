import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class PingPacket extends BaseRootPacket {
    static messageTag = SendOption.Ping;

    constructor(public readonly nonce: number) {
        super(PingPacket.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const nonce = reader.uint16(true);
        return new PingPacket(nonce);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
    }

    clone() {
        return new PingPacket(this.nonce);
    }
}
