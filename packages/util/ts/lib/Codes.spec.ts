import assert from "assert"

import {
    V1Code2Int,
    V1Gen,
    V1Int2Code,
    V2Code2Int,
    V2Gen,
    V2Int2Code,
    Code2Int,
    Int2Code
} from "./Codes"

describe("V1Code2Int", () => {
    it("Should convert a 4 letter code (version 1) to an integer.", () => {
        assert.strictEqual(V1Code2Int("CODE"), 1129268293);
        assert.strictEqual(V1Code2Int("LAMP"), 1279348048);
    });
});

describe("V1Int2Code", () => {
    it("Should convert an integer to a 4 letter code (version 1).", () => {
        assert.strictEqual(V1Int2Code(1094861377), "ABBA");
        assert.strictEqual(V1Int2Code(1414483788), "TOOL");
    });
});

describe("V2Code2Int", () => {
    it("Should convert a 6 letter code (version 2) to an integer.", () => {
        assert.strictEqual(V2Code2Int("STRUCT"), -2061964175);
        assert.strictEqual(V2Code2Int("REGION"), -1720475437);
    });
});