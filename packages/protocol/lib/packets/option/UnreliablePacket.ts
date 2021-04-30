import { SendOption } from "@skeldjs/constant";
import { HazelReader } from "@skeldjs/util";

import { BaseRootMessage } from "../root/BaseRootMessage";
import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { NormalPacket } from "./NormalPacket";

export class UnreliablePacket extends NormalPacket {
    static tag = SendOption.Unreliable as const;
    tag = SendOption.Unreliable as const;

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
}
