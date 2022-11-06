import { assert } from "console";
import crypto from "crypto";

export class Aes128Gcm {
    static KeySize = 16;
    static NonceSize = 12;
    static CipherTextOverhead = 16;

    static TagSize = 16;

    cipher: crypto.Cipher;

    hashSubKey: Buffer;
    blockJ: Buffer;
    blockS: Buffer;
    blockZ: Buffer;
    blockV: Buffer;
    blockScratch: Buffer;

    constructor(public readonly key: Buffer) {
        const scratchSpace = Buffer.alloc(96);
        this.hashSubKey = scratchSpace.slice(0, 16);
        this.blockJ = scratchSpace.slice(16, 32);
        this.blockS = scratchSpace.slice(32, 48);
        this.blockZ = scratchSpace.slice(48, 64);
        this.blockV = scratchSpace.slice(64, 80);
        this.blockScratch = scratchSpace.slice(80, 96);

        this.cipher = crypto.createCipheriv("aes-128-ecb", key, "");
        this.cipher.update(this.hashSubKey).copy(this.hashSubKey);
    }

    seal(output: Buffer, nonce: Buffer, plaintext: Buffer, associatedData: Buffer) {
        if (nonce.byteLength !== Aes128Gcm.NonceSize) {
            throw new TypeError("Invalid nonce size: " + nonce.byteLength);
        }
        if (output.byteLength < plaintext.byteLength + Aes128Gcm.CipherTextOverhead) {
            throw new TypeError("Invalid output size: " + output.byteLength);
        }

        nonce.copy(this.blockJ);
        this.gctr(output, this.blockJ, 2, plaintext);
        this.generateAuthTag(output.slice(plaintext.byteLength), output.slice(0, plaintext.byteLength), associatedData);
    }

    open(output: Buffer, nonce: Buffer, ciphertext: Buffer, associatedData: Buffer) {
        if (nonce.byteLength !== Aes128Gcm.NonceSize) {
            throw new TypeError("Invalid nonce size: " + nonce.byteLength);
        }
        if (ciphertext.byteLength < Aes128Gcm.CipherTextOverhead) {
            throw new TypeError("Invalid ciphertext size: " + ciphertext.byteLength);
        }
        if (output.byteLength < ciphertext.byteLength - Aes128Gcm.CipherTextOverhead) {
            throw new TypeError("Invalid output size: " + output.byteLength);
        }

        const authTag = ciphertext.slice(ciphertext.byteLength - Aes128Gcm.TagSize);
        ciphertext = ciphertext.slice(0, ciphertext.byteLength - Aes128Gcm.TagSize);

        nonce.copy(this.blockJ);

        this.generateAuthTag(this.blockScratch, ciphertext, associatedData);
        if (Buffer.compare(this.blockScratch, authTag)) {
            throw new Error("Bad auth.");
        }

        this.gctr(output, this.blockJ, 2, ciphertext);
        return true;
    }

    generateAuthTag(output: Buffer, ciphertext: Buffer, associatedData: Buffer) {
        assert(output.byteLength >= Aes128Gcm.TagSize);

        this.blockS.fill(0);

        let fullBlocks = Math.floor(associatedData.byteLength / 16);
        this.ghash(this.blockS, associatedData, fullBlocks);
        if (fullBlocks * 16 < associatedData.byteLength) {
            this.blockScratch.fill(0);
            associatedData.copy(this.blockScratch, 0, fullBlocks * 16);
            this.ghash(this.blockS, this.blockScratch, 1);
        }

        fullBlocks = Math.floor(ciphertext.byteLength / 16);
        this.ghash(this.blockS, ciphertext, fullBlocks);
        if (fullBlocks * 16 < ciphertext.byteLength) {
            this.blockScratch.fill(0);
            ciphertext.copy(this.blockScratch, 0, fullBlocks * 16);
            this.ghash(this.blockS, this.blockScratch, 1);
        }

        const associatedDataLength = 8 * associatedData.byteLength;
        const ciphertextDataLength = 8 * ciphertext.byteLength;
        this.blockScratch.writeBigInt64BE(BigInt(associatedDataLength));
        this.blockScratch.writeBigInt64BE(BigInt(ciphertextDataLength), 8);

        this.ghash(this.blockS, this.blockScratch, 1);
        this.gctr(output, this.blockJ, 1, this.blockS);
    }

    gctr(output: Buffer, counterBlock: Buffer, counter: number, data: Buffer) {
        assert(counterBlock.byteLength === 16);
        assert(output.byteLength >= data.byteLength);

        let writeIdx = 0;
        const numBlocks = Math.floor((data.byteLength + 15) / 16);
        for (let i = 0; i < numBlocks; ++i) {
            counterBlock.writeInt32BE(counter, 12);
            counter++;
            this.cipher.update(counterBlock).copy(this.blockScratch);

            for (let j = 0; j < 16 && writeIdx < data.byteLength; ++j, ++writeIdx) {
                output[writeIdx] = data[writeIdx] ^ this.blockScratch[j];
            }
        }
    }

    ghash(output: Buffer, data: Buffer, numBlocks: number) {
        assert(output.byteLength === 16);
        assert(data.byteLength >= numBlocks * 16);

        let readIdx = 0;
        for (let i = 0; i < numBlocks; ++i) {
            for (let j = 0; j < 16; ++j, ++readIdx) {
                output[j] ^= data[readIdx];
            }

            Aes128Gcm.multiplyGf128Elements(output, this.hashSubKey, this.blockZ, this.blockV);
        }
    }

    static multiplyGf128Elements(x: Buffer, y: Buffer, scratchZ: Buffer, scratchV: Buffer) {
        assert(x.byteLength === 16);
        assert(y.byteLength === 16);
        assert(scratchZ.byteLength === 16);
        assert(scratchV.byteLength === 16);

        scratchZ.fill(0);
        x.copy(scratchV);

        for (let i = 0; i < 128; ++i) {
            const bitIdx = 7 - (i % 8);
            if ((y[Math.floor(i / 8)] & (1 << bitIdx)) > 0) {
                for (let j = 0; j < 16; ++j) {
                    scratchZ[j] ^= scratchV[j];
                }
            }

            let carry = false;
            for (let j = 0; j < 16; ++j) {
                const newCarry = (scratchV[j] & 0x1) > 0;
                scratchV[j] >>= 1;
                if (carry) {
                    scratchV[j] |= 0x80;
                }
                carry = newCarry;
            }
            if (carry) {
                scratchV[0] ^= 0xe1;
            }
        }

        scratchZ.copy(x);
    }
}
