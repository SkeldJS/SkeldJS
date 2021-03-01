import assert from "assert"

import {
    EncodeVersionInfo,
    EncodeVersion,
    DecodeVersion,
    FormatVersionInfo,
    FormatVersion
} from "./Version"

describe("Version utility functions", () => {
    describe("EncodeVersionInfo", () => {
        it("Should convert information about a version into an integer.", () => {
            assert.strictEqual(EncodeVersionInfo({
                year: 2020,
                month: 11,
                day: 17,
                revision: 0
            }), 50520650);
        });
    });

    describe("EncodeVersion", () => {
        it("Should convert information about a version into an integer.", () => {
            assert.strictEqual(EncodeVersion(2020, 11, 17, 0), 50520650)
        });
    });

    describe("DecodeVersion", () => {
        it("Should get information about a version from an integer.", () => {
            assert.deepStrictEqual(DecodeVersion(50516650), {
                year: 2020,
                month: 9,
                day: 9,
                revision: 0
            });
        });
    });

    describe("FormatVersionInfo", () => {
        it("Should format version information into a recognisable syntax.", () => {
            assert.strictEqual(FormatVersionInfo({
                year: 2020,
                month: 9,
                day: 9,
                revision: 0
            }), "2020.9.9.0");
        });
        
        it("Should format a version integer into a recognisable syntax.", () => {
            assert.strictEqual(FormatVersionInfo(50516650), "2020.9.9.0");
        });
    });

    describe("FormatVersion", () => {
        it("Should format version information into a recognisable syntax.", () => {
            assert.strictEqual(FormatVersion(2020, 9, 9, 0), "2020.9.9.0");
        });
    });
});