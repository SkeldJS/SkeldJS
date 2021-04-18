import { SendOption } from "@skeldjs/constant";
import { HazelReader } from "@skeldjs/util";

import { PacketDecoder } from "../PacketDecoder";
import { MessageDirection } from "./BaseMessage";
import { RootMessage } from "./RootMessage";
import { NormalPacket } from "./NormalPacket";

export class UnreliablePacket extends NormalPacket {
    constructor(public readonly messages: RootMessage[]) {
        super(SendOption.Reliable, messages);
    }

    static Deserialize(direction: MessageDirection, reader: HazelReader, decoder: PacketDecoder) {
        const normal = super.Deserialize(direction, reader, decoder);

        return new UnreliablePacket(normal.messages);
    }
}
