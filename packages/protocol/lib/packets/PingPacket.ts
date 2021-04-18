import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../PacketDecoder";
import { MessageDirection } from "./BaseMessage";
import { RootPacket } from "./RootPacket";

export type MissingPackets = boolean[];

export class PingPacket extends RootPacket {
    constructor(
        public readonly nonce: number
    ) {
        super(SendOption.Ping);
    }

    static Deserialize(direction: MessageDirection, reader: HazelReader) {
        const nonce = reader.uint16(true);
        return new PingPacket(nonce);
    }

    Serialize(direction: MessageDirection, writer: HazelWriter) {
        writer.uint16(this.nonce, true);
    }
}
