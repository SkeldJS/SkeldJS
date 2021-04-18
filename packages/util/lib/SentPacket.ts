export interface SentPacket {
    nonce: number;
    ackd: boolean;
}

export function createMissingBitfield(sent: SentPacket[]) {
    let val = 0xff;

    for (let i = 0; i < Math.min(8, sent.length); i++) {
        const packet = sent[i];

        if (!packet.ackd) {
            val ^= 1 << i;
        }
    }

    return val;
}

export function getMissing(recv: number[], bits: number) {
    return recv.reverse().filter((_, i) => {
        return (bits & (1 << i)) === 0;
    });
}
