export class Version {
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
    static fromEncoded(version: number): Version {
        const year = Math.floor(version / 25000);
        version %= 25000;
        const month = Math.floor(version / 1800);
        version %= 1800;
        const day = Math.floor(version / 50);
        const revision = version % 50;

        return new Version(year, month, day, revision);
    }

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
    static fromString(version: string): Version {
        const parts = version.split(".");
        const year = parts[0] || "0";
        const month = parts[1] || "0";
        const day = parts[2] || "0";
        const revision = parts[3] || "0";

        return new Version(
            parseInt(year),
            parseInt(month),
            parseInt(day),
            parseInt(revision)
        );
    }

    constructor(
        public year: number,
        public month: number,
        public day: number,
        public revision: number = 0
    ) {}

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
    toEncoded() {
        return (
            this.year * 25000 +
            this.month * 1800 +
            this.day * 50 +
            this.revision
        );
    }
}
