import assert from "assert";

import { unary } from "./unary";

function multiply(num, i = 2) {
    return num * i;
}

describe("unary", () => {
    it("Should pass only a specified number of arguments to a callback.", () => {
        const nums = [1, 2, 3, 4, 5, 6];

        assert.deepStrictEqual(nums.map(unary(multiply)), [2, 4, 6, 8, 10, 12]);
        assert.deepStrictEqual(nums.map(unary(multiply, 2)), [
            0,
            2,
            6,
            12,
            20,
            30,
        ]);
    });
});
