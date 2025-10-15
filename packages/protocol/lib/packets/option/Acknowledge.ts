import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootPacket } from "./BaseRootPacket";

export type MissingPackets = number[];

export class AcknowledgePacket extends BaseRootPacket {
    static messageTag = SendOption.Acknowledge;

    constructor(public readonly nonce: number, public readonly missingPackets: MissingPackets) {
        super(AcknowledgePacket.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const nonce = reader.uint16(true);
        const missing = reader.uint8();

        const arr: MissingPackets = [];
        for (let i = 0; i < 8; i++) {
            if ((missing & (1 << i)) === 0) {
                arr.push(i);
            }
        }

        return new AcknowledgePacket(nonce, arr);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.nonce, true);

        let bit = 0xff;
        for (let i = 0; i < this.missingPackets.length; i++) {
            bit &= ~(1 << this.missingPackets[i]);
        }

        writer.uint8(bit);
    }

    clone() {
        return new AcknowledgePacket(this.nonce, [...this.missingPackets]);
    }
}
