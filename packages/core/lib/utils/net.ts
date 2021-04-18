export class NetworkUtils {
    /**
     * Check whether a given sequence ID is greater than another.
     * @param newSid The new sequence ID.
     * @param oldSid The older sequence ID.
     */
     static seqIdGreaterThan(newSid: number, oldSid: number, bytes = 2) {
        if (typeof oldSid !== "number") return true;

        const threshold = 2 ** ((bytes * 8) - 1);
        const num = oldSid + threshold;

        if (oldSid < num) {
            return newSid > oldSid && newSid <= num;
        }

        return newSid > oldSid || newSid <= num;
    }
}
