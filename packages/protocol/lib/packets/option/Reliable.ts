import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "../root/BaseRootMessage";
import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { NormalPacket } from "./Normal";

export class ReliablePacket extends NormalPacket {
    static messageTag = SendOption.Reliable as const;
    messageTag = SendOption.Reliable as const;

    readonly nonce: number;

    constructor(nonce: number, children: BaseRootMessage[]) {
        super(children);

        this.nonce = nonce;
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

    clone() {
        return new ReliablePacket(this.nonce, this.children.map(child => child.clone()));
    }
}
