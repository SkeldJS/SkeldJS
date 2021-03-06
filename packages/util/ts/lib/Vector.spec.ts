import assert from "assert";

import { clampValue, lerpValue, unlerpValue } from "./Vector";

describe("Vector utility functions", () => {
    describe("clampValue", () => {
        it("Should clamp a value between two boundaries.", () => {
            const val = 0.3;

            assert.strictEqual(clampValue(val, 0, 1), 0.3);
            assert.strictEqual(clampValue(val, 0.5, 1), 0.5);
            assert.strictEqual(clampValue(val, 0, 0.2), 0.2);
        });
    });

    describe("lerpValue", () => {
        it("Should map a value linearly from between 0 and 1 to between two points.", () => {
            assert.strictEqual(lerpValue(0.25), -20);
            assert.strictEqual(lerpValue(0.75), 20);
            assert.strictEqual(lerpValue(0), -40);

            assert.strictEqual(lerpValue(0.5, -Infinity, 1000), 1000);
        });
    });

    describe("unlerpValue", () => {
        it("Should map a value linearly from between two points to between 0 and 1.", () => {
            assert.strictEqual(unlerpValue(0), 0.5);
            assert.strictEqual(unlerpValue(20), 0.75);
            assert.strictEqual(unlerpValue(60), 1.25);
            assert.strictEqual(unlerpValue(-40), 0);

            assert.strictEqual(unlerpValue(3, 1, 4), (1 / 3) * 2);
        });
    });
});
