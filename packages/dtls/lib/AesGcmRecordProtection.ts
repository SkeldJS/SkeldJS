import { HazelWriter } from "@skeldjs/util";
import crypto from "crypto";

import { Aes128Gcm } from "./AeadAes128Gcm";

import { RecordHeader } from "./RecordHeader";
import { RecordProtection } from "./RecordProtection";
import { uint48 } from "./types/uint48";

const implicitNonceSize = 4;
const explicitNonceSize = 8;

export function expandSecret(output: Buffer, key: Buffer, label: string, initialSeed: Buffer) {
    let writer = output;

    const labelBytes = Buffer.from(label, "ascii");
    const roundSeed = Buffer.alloc(labelBytes.byteLength + initialSeed.byteLength);
    labelBytes.copy(roundSeed, 0, 0, labelBytes.byteLength);
    initialSeed.copy(roundSeed, labelBytes.byteLength, 0, initialSeed.byteLength);

    let hashA = roundSeed;
    const input = Buffer.alloc(1 + roundSeed.byteLength);
    roundSeed.copy(input, 1);

    while (writer.byteLength > 0) {
        hashA = crypto.createHmac("sha256", key).update(hashA).digest();
        hashA.copy(input, 0, 0, hashA.byteLength);

        let roundOutput = crypto.createHmac("sha256", key).update(input).digest();
        if (roundOutput.byteLength > writer.byteLength) {
            roundOutput = roundOutput.slice(0, writer.byteLength);
        }

        roundOutput.copy(writer, 0, 0, roundOutput.byteLength);
        writer = writer.slice(roundOutput.length);
    }
}

export class AesGcmRecordProtection extends RecordProtection {
    clientWriteKey: Buffer;
    serverWriteKey: Buffer;

    serverWriteIV: Buffer;
    clientWriteIV: Buffer;

    clientCipher: Aes128Gcm;
    serverCipher: Aes128Gcm;

    constructor(
        public readonly masterSecret: Buffer,
        public readonly serverRandom: Buffer,
        public readonly clientRandom: Buffer
    ) {
        super();

        const combinedRandom = Buffer.alloc(serverRandom.byteLength + clientRandom.byteLength);
        serverRandom.copy(combinedRandom, 0, 0, serverRandom.byteLength);
        clientRandom.copy(combinedRandom, serverRandom.byteLength, 0, clientRandom.byteLength);

        const expandedSize = 0 +
            0 +
            0 +
            16 +
            16 +
            implicitNonceSize +
            implicitNonceSize;

        const expandedKey = Buffer.alloc(expandedSize);
        expandSecret(expandedKey, masterSecret, "key expansion", combinedRandom);

        this.clientWriteKey = expandedKey.slice(0, 16);
        this.serverWriteKey = expandedKey.slice(16, 16 + 16);
        this.clientWriteIV = expandedKey.slice(2 * 16, (2 * 16) + implicitNonceSize);
        this.serverWriteIV = expandedKey.slice((2 * 16) + implicitNonceSize, (2 * 16) + implicitNonceSize + implicitNonceSize);


        this.clientCipher = new Aes128Gcm(this.clientWriteKey);
        this.serverCipher = new Aes128Gcm(this.serverWriteKey);
    }

    getEncryptedSize(dataSize: number) {
        return dataSize + Aes128Gcm.TagSize;
    }

    getDecryptedSize(dataSize: number) {
        return dataSize - Aes128Gcm.TagSize;
    }

    encryptServerPlaintext(input: Buffer, record: RecordHeader) {
        return this.encryptPlaintext(input, record, this.serverCipher, this.serverWriteIV);
    }

    encryptClientPlaintext(input: Buffer, record: RecordHeader) {
        return this.encryptPlaintext(input, record, this.clientCipher, this.clientWriteIV);
    }

    private encryptPlaintext(input: Buffer, record: RecordHeader, cipher: Aes128Gcm, writeIV: Buffer) {
        const nonce = HazelWriter.alloc(implicitNonceSize + explicitNonceSize);
        nonce.bytes(writeIV);
        nonce.uint16(record.epoch, true);
        nonce.write(uint48, record.sequenceNumber, true);

        const plaintextRecord = new RecordHeader(
            record.contentType,
            record.epoch,
            record.sequenceNumber,
            input.byteLength
        );
        const associatedData = HazelWriter.alloc(RecordHeader.size);
        associatedData.write(plaintextRecord);

        const output = Buffer.alloc(this.getEncryptedSize(input.byteLength));
        cipher.seal(output, nonce.buffer, input, associatedData.buffer);
        return output;
    }

    decryptCiphertextFromServer(input: Buffer, record: RecordHeader) {
        return this.decryptCiphertext(input, record, this.serverCipher, this.serverWriteIV);
    }

    decryptCiphertextFromClient(input: Buffer, record: RecordHeader) {
        return this.decryptCiphertext(input, record, this.clientCipher, this.clientWriteIV);
    }

    private decryptCiphertext(input: Buffer, record: RecordHeader, cipher: Aes128Gcm, writeIV: Buffer) {
        const nonce = HazelWriter.alloc(implicitNonceSize + explicitNonceSize);
        nonce.bytes(writeIV);
        nonce.uint16(record.epoch, true);
        nonce.write(uint48, record.sequenceNumber, true);

        record.length = this.getDecryptedSize(input.byteLength);
        const associatedData = HazelWriter.alloc(RecordHeader.size);
        associatedData.write(record);

        const output = Buffer.alloc(this.getDecryptedSize(input.byteLength));
        cipher.open(output, nonce.buffer, input, associatedData.buffer);

        return output;
    }
}
