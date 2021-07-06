import { RecordHeader } from "./RecordHeader";
import { RecordProtection } from "./RecordProtection";

export class NullRecordProtection extends RecordProtection {
    getEncryptedSize(dataSize: number) {
        return dataSize;
    }

    getDecryptedSize(dataSize: number) {
        return dataSize;
    }

    encryptServerPlaintext(input: Buffer, record: RecordHeader) {
        return input;
    }

    encryptClientPlaintext(input: Buffer, record: RecordHeader) {
        return input;
    }

    decryptCiphertextFromServer(input: Buffer, record: RecordHeader) {
        return input;
    }

    decryptCiphertextFromClient(input: Buffer, record: RecordHeader) {
        return input;
    }
}
