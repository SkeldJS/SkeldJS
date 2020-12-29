export interface SentPacket {
    nonce: number;
    ackd: boolean;
}

export function createMissingBitfield(sent: SentPacket[]) {
    let val = 0xFF;

    for (let i = 0; i < sent.length; i++) {
        const packet = sent[i];

        if (!packet.ackd) {
            val ^= 1 << i;
        }
    }

    return val;
}

export function getMissing(recv: number[], bits: number) {
    return recv.filter((_, i) => (bits & (1 << i)) > 0);
}