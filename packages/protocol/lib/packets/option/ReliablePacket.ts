import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "../root/BaseRootMessage";
import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { NormalPacket } from "./NormalPacket";

export class ReliablePacket extends NormalPacket {
    static tag = SendOption.Reliable as const;
    tag = SendOption.Reliable as const;

    constructor(
        public readonly nonce: number,
        public readonly children: BaseRootMessage[]
    ) {
        super(children);
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const nonce = reader.uint16(true);
        const normal = super.Deserialize(reader, direction, decoder);

        return new ReliablePacket(nonce, normal.children);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.uint16(this.nonce, true);
        super.Serialize(writer, direction, decoder);
    }
}
