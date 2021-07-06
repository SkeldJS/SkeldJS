import { HazelReader } from "./HazelReader";
import { HazelWriter } from "./HazelWriter";

export interface VersionInfo {
    year: number;
    month: number;
    day: number;
    revision: number;
}

export class VersionInfo {
    /**
     * Create a version from an encoded integer.
     * @param version The integer.
     * @example
     * ```ts
     * const version = VersionInfo.from(50532300);
     *
     * console.log(version.toString()); // => 2021.4.25
     * ```
     */
    static from(version: number): VersionInfo;
    /**
     * Create a version from a formatted string.
     * @param version The formatted string.
     * @example
     * ```ts
     * const version = VersionInfo.from("2021.4.25s");
     *
     * console.log(version.toString()); // => 2021.4.25
     * ```
     */
    static from(version: string): VersionInfo;
    static from(version: number | string): VersionInfo;
    static from(version: number | string) {
        if (typeof version === "number") {
            const year = Math.floor(version / 25000);
            version %= 25000;
            const month = Math.floor(version / 1800);
            version %= 1800;
            const day = Math.floor(version / 50);
            const revision = version % 50;

            return new VersionInfo(year, month, day, revision);
        } else {
            const parts = version.split(".");
            const year = parts[0] || "0";
            const month = parts[1] || "0";
            const day = parts[2] || "0";
            const revision = parts[3] || "0";

            return new VersionInfo(
                parseInt(year),
                parseInt(month),
                parseInt(day),
                parseInt(revision)
            );
        }
    }

    /**
     * The year that the version was released.
     */
    year: number;

    /**
     * The month that the version was released.
     */
    month: number;

    /**
     * The day that the version was released.
     */
    day: number;

    /**
     * The revision/build of the version.
     */
    revision: number;

    constructor(
        year: number,
        month: number,
        day: number,
        revision: number = 0
    ) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.revision = revision;
    }

    static Deserialize(reader: HazelReader) {
        const num = reader.uint32();

        return VersionInfo.from(num);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.encode());
    }

    /**
     * Convert the version into a human-readable string format.
     * @returns The version as a string.
     * @example
     * ```ts
     * const version = new VersionInfo(2021, 4, 2);
     *
     * console.log(version.toString()); // => 2021.4.25
     * ```
     */
    toString() {
        return (
            this.year + "." + this.month + "." + this.day + "." + this.revision
        );
    }

    /**
     * Encode the version as an integer.
     * @returns The version as an integer.
     * @example
     * ```ts
     * const version = new VersionInfo(2021, 4, 2);
     *
     * console.log(version.encode()); // => 50532300
     * ```
     */
    encode() {
        return (
            this.year * 25000 +
            this.month * 1800 +
            this.day * 50 +
            this.revision
        );
    }
}
