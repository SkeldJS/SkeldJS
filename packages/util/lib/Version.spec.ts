import assert from "assert";
import { HazelReader } from "./HazelReader";
import { HazelWriter } from "./HazelWriter";

import { VersionInfo } from "./Version";

describe("VersionInfo", () => {
    describe("VersionInfo#ctr", () => {
        it("Should create a version from basic version information..", () => {
            const version = new VersionInfo(2021, 4, 2);

            assert.strictEqual(version.year, 2021);
            assert.strictEqual(version.month, 4);
            assert.strictEqual(version.day, 2);
        });
    });

    describe("VersionInfo#from", () => {
        it("Should create a version from a string.", () => {
            const version = VersionInfo.from("2021.4.2s");

            assert.strictEqual(version.year, 2021);
            assert.strictEqual(version.month, 4);
            assert.strictEqual(version.day, 2);
        });

        it("Should create a version from a number.", () => {
            const version = VersionInfo.from(50532300);

            assert.strictEqual(version.year, 2021);
            assert.strictEqual(version.month, 4);
            assert.strictEqual(version.day, 2);
        });
    });

    describe("VersionInfo#Deserialize", () => {
        it("Should create a version from deserializing a buffer.", () => {
            const reader = HazelReader.from("cc0f0303", "hex");
            const version = VersionInfo.Deserialize(reader);

            assert.strictEqual(version.year, 2021);
            assert.strictEqual(version.month, 4);
            assert.strictEqual(version.day, 2);
        });
    });

    describe("VersionInfo#Serialize", () => {
        it("Should create a version from serializing a buffer.", () => {
            const writer = HazelWriter.alloc(4);
            const version = new VersionInfo(2021, 4, 2);

            version.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "cc0f0303");
        });
    });

    describe("VersionInfo#toString", () => {
        it("Should convert the version into a human-readable string.", () => {
            const version = new VersionInfo(2021, 4, 2);

            assert.deepStrictEqual(version.toString(), "2021.4.2.0");
        });
    });

    describe("VersionInfo#encode", () => {
        it("Should convert the version into a number.", () => {
            const version = new VersionInfo(2021, 4, 2);

            assert.deepStrictEqual(version.encode(), 50532300);
        });
    });
});
