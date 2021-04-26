import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export type MissingPackets = number[];

export class AcknowledgePacket extends BaseRootPacket {
    static tag = SendOption.Acknowledge as const;
    tag = SendOption.Acknowledge as const;

    constructor(
        public readonly nonce: number,
        public readonly missingPackets: MissingPackets
    ) {
        super();
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
            if (!this.missingPackets[i]) {
                bit &= ~(1 << i);
            }
        }

        writer.uint8(bit);
    }
}
