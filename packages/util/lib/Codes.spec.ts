import assert from "assert";

import {
    GameCode
} from "./Codes";

describe("GameCode", () => {
    describe("GameCode#convertV1StringToInt", () => {
        it("Should convert a 4 letter code (version 1) to an integer.", () => {
            assert.strictEqual(GameCode.convertV1StringToInt("CODE"), 1162104643);
            assert.strictEqual(GameCode.convertV1StringToInt("LAMP"), 1347240268);
        });
    });

    describe("GameCode#convertV1IntToString", () => {
        it("Should convert an integer to a 4 letter code (version 1).", () => {
            assert.strictEqual(GameCode.convertV1IntToString(1094861377), "ABBA");
            assert.strictEqual(GameCode.convertV1IntToString(1280266068), "TOOL");
        });
    });

    describe("GameCode#generateV1", () => {
        it("Should generate a random 4 letter code (version 1) as an integer.", () => {
            const regex = /^[A-Z]{4}$/;
            const code = GameCode.generateV1();

            assert(code >= 1094795585);
            assert(code <= 1515870810);
            assert(regex.test(GameCode.convertV1IntToString(code)));
        });
    });

    describe("GameCode#convertV2StringToInt", () => {
        it("Should convert a 6 letter code (version 2) to an integer.", () => {
            assert.strictEqual(GameCode.convertV2StringToInt("STRUCT"), -2061964175);
            assert.strictEqual(GameCode.convertV2StringToInt("REGION"), -1720475437);
        });
    });

    describe("GameCode#convertV2IntToString", () => {
        it("Should convert an integer to a 6 letter code (version 2).", () => {
            assert.strictEqual(GameCode.convertV2IntToString(-1998843519), "BUMOLE");
            assert.strictEqual(GameCode.convertV2IntToString(-1682506269), "JOJOBA");
        });
    });

    describe("GameCode#generateV2", () => {
        it("Should generate a random 6 letter code (version 2) as an integer.", () => {
            const regex = /^[A-Z]{6}$/;
            const code = GameCode.generateV2();

            assert(code >= -2147483648);
            assert(code <= -1679540573);
            assert(regex.test(GameCode.convertV2IntToString(code)));
        });
    });

    describe("GameCode#convertStringToInt", () => {
        it("Should convert a 4 or 6 letter code to an integer.", () => {
            assert.strictEqual(GameCode.convertStringToInt("HOLA"), 1095520072);
            assert.strictEqual(GameCode.convertStringToInt("VECTOR"), -2080903964);
        });

        it("Should return 0 on an invalid code length.", () => {
            assert.strictEqual(GameCode.convertStringToInt("IMPOSTER"), 0);
            assert.strictEqual(GameCode.convertStringToInt("SUS"), 0);
        });
    });

    describe("GameCode#convertIntToString", () => {
        it("Should convert an integer to a 4 or 6 letter code.", () => {
            assert.strictEqual(GameCode.convertIntToString(-2050590356), "QUEASY");
            assert.strictEqual(GameCode.convertIntToString(1515864394), "JAZZ");
        });
    });
});
