export enum SequenceIdType {
    Byte = 1,
    Short = 2,
    Integer = 4,
}

/**
 * Check whether a given sequence ID is greater than another.
 * @param newSid The new sequence ID.
 * @param oldSid The older sequence ID.
 */
export function sequenceIdGreaterThan(newSid: number, oldSid: number, bytes: SequenceIdType) {
    if (typeof oldSid !== "number") return true;

    const threshold = 2 ** (bytes * 8 - 1);
    const num = oldSid + threshold;

    if (oldSid < num) {
        return newSid > oldSid && newSid <= num;
    }

    return newSid > oldSid || newSid <= num;
}
