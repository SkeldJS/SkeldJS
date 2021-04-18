import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../PacketDecoder";
import { MessageDirection } from "./BaseMessage";
import { RootMessage } from "./RootMessage";
import { NormalPacket } from "./NormalPacket";

export class ReliablePacket extends NormalPacket {
    constructor(public readonly nonce: number, public readonly messages: RootMessage[]) {
        super(SendOption.Reliable, messages);
    }

    static Deserialize(direction: MessageDirection, reader: HazelReader, decoder: PacketDecoder) {
        const nonce = reader.uint16(true);
        const normal = super.Deserialize(direction, reader, decoder);

        return new ReliablePacket(nonce, normal.messages);
    }

    Serialize(direction: MessageDirection, writer: HazelWriter, decoder: PacketDecoder) {
        writer.uint16(this.nonce, true);
        super.Serialize(direction, writer, decoder);
    }
}
