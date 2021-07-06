import { RecordHeader } from "./RecordHeader";

export abstract class RecordProtection {
    abstract getEncryptedSize(dataSize: number): number;
    abstract getDecryptedSize(dataSize: number): number;

    abstract encryptServerPlaintext(input: Buffer, record: RecordHeader): Buffer;
    abstract encryptClientPlaintext(input: Buffer, record: RecordHeader): Buffer;
    abstract decryptCiphertextFromServer(input: Buffer, record: RecordHeader): Buffer;
    abstract decryptCiphertextFromClient(input: Buffer, record: RecordHeader): Buffer;
}
