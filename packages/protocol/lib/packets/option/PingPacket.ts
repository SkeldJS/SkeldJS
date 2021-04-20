import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class PingPacket extends BaseRootPacket {
    static tag = SendOption.Ping as const;
    tag = SendOption.Ping as const;

    constructor(public readonly nonce: number) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const nonce = reader.uint16(true);
        return new PingPacket(nonce);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
    }
}
