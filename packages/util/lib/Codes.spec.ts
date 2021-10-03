import assert from "assert";

import {
    V1Code2Int,
    V1Gen,
    V1Int2Code,
    V2Code2Int,
    V2Gen,
    V2Int2Code,
    Code2Int,
    Int2Code,
} from "./Codes";

describe("Code utility functions", () => {
    describe("V1Code2Int", () => {
        it("Should convert a 4 letter code (version 1) to an integer.", () => {
            assert.strictEqual(V1Code2Int("CODE"), 1162104643);
            assert.strictEqual(V1Code2Int("LAMP"), 1347240268);
        });
    });

    describe("V1Int2Code", () => {
        it("Should convert an integer to a 4 letter code (version 1).", () => {
            assert.strictEqual(V1Int2Code(1094861377), "ABBA");
            assert.strictEqual(V1Int2Code(1280266068), "TOOL");
        });
    });

    describe("V1Gen", () => {
        it("Should generate a random 4 letter code (version 1) as an integer.", () => {
            const regex = /^[A-Z]{4}$/;
            const code = V1Gen();

            assert(code >= 1094795585);
            assert(code <= 1515870810);
            assert(regex.test(V1Int2Code(code)));
        });
    });

    describe("V2Code2Int", () => {
        it("Should convert a 6 letter code (version 2) to an integer.", () => {
            assert.strictEqual(V2Code2Int("STRUCT"), -2061964175);
            assert.strictEqual(V2Code2Int("REGION"), -1720475437);
        });
    });

    describe("V2Int2Code", () => {
        it("Should convert an integer to a 6 letter code (version 2).", () => {
            assert.strictEqual(V2Int2Code(-1998843519), "BUMOLE");
            assert.strictEqual(V2Int2Code(-1682506269), "JOJOBA");
        });
    });

    describe("V2Gen", () => {
        it("Should generate a random 6 letter code (version 2) as an integer.", () => {
            const regex = /^[A-Z]{6}$/;
            const code = V2Gen();

            assert(code >= -2147483648);
            assert(code <= -1679540573);
            assert(regex.test(V2Int2Code(code)));
        });
    });

    describe("Code2Int", () => {
        it("Should convert a 4 or 6 letter code to an integer.", () => {
            assert.strictEqual(Code2Int("HOLA"), 1095520072);
            assert.strictEqual(Code2Int("VECTOR"), -2080903964);
        });

        it("Should return 0 on an invalid code length.", () => {
            assert.strictEqual(Code2Int("IMPOSTER"), 0);
            assert.strictEqual(Code2Int("SUS"), 0);
        });
    });

    describe("Int2Code", () => {
        it("Should convert an integer to a 4 or 6 letter code.", () => {
            assert.strictEqual(Int2Code(-2050590356), "QUEASY");
            assert.strictEqual(Int2Code(1515864394), "JAZZ");
        });
    });
});
