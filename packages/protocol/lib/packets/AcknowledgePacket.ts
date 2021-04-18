import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../PacketDecoder";
import { MessageDirection } from "./BaseMessage";
import { RootPacket } from "./RootPacket";

export type MissingPackets = boolean[];

export class AcknowledgePacket extends RootPacket {
    constructor(
        public readonly nonce: number,
        public readonly missingPackets: MissingPackets
    ) {
        super(SendOption.Acknowledge);
    }

    static Deserialize(direction: MessageDirection, reader: HazelReader) {
        const nonce = reader.uint16(true);
        const missing = reader.uint8();

        const arr: MissingPackets = [];
        for (let i = 0; i < 8; i++) {
            arr.push((missing & (1 << i)) > 0);
        }

        return new AcknowledgePacket(nonce, arr);
    }

    Serialize(direction: MessageDirection, writer: HazelWriter) {
        writer.uint16(this.nonce, true);

        let bit = 0xff;
        for (let i = 0; i < this.missingPackets.length; i++) {
            if (!this.missingPackets[i]) {
                bit &= ~(1 << i);
            }
        }

        writer.uint8(bit);
    }
}
