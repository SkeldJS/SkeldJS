import { SendOption } from "@skeldjs/constant";
import { HazelReader } from "@skeldjs/util";

import { BaseRootMessage } from "../root/BaseRootMessage";
import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { NormalPacket } from "./Normal";

export class UnreliablePacket extends NormalPacket {
    static messageTag = SendOption.Unreliable as const;
    messageTag = SendOption.Unreliable as const;

    constructor(children: BaseRootMessage[]) {
        super(children);
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const normal = super.Deserialize(reader, direction, decoder);

        return new UnreliablePacket(normal.children);
    }

    clone() {
        return new UnreliablePacket(this.children.map(child => child.clone()));
    }
}
