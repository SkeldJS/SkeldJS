import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export type MissingPackets = number[];

export class AcknowledgePacket extends BaseRootPacket {
    static messageTag = SendOption.Acknowledge as const;
    messageTag = SendOption.Acknowledge as const;

    readonly nonce: number;
    readonly missingPackets: MissingPackets;

    constructor(nonce: number, missingPackets: MissingPackets) {
        super();

        this.nonce = nonce;
        this.missingPackets = missingPackets;
    }

    static Deserialize(reader: HazelReader) {
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

    Serialize(writer: HazelWriter) {
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
