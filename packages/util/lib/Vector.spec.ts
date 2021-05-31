import assert from "assert";
import { HazelReader } from "./HazelReader";
import { HazelWriter } from "./HazelWriter";

import { Vector2 } from "./Vector";

describe("Vector2", () => {
    describe("Vector2#null", () => {
        it("Should return a null vector.", () => {
            const vector = Vector2.null;

            assert.strictEqual(vector.x, 0);
            assert.strictEqual(vector.y, 0);
        });
    });

    describe("Vector2#ctr", () => {
        it("Should create a vector from nothing.", () => {
            const vector = new Vector2;

            assert.strictEqual(vector.x, 0);
            assert.strictEqual(vector.y, 0);
        });

        it("Should create a vector from a single number.", () => {
            const vector = new Vector2(5);

            assert.strictEqual(vector.x, 5);
            assert.strictEqual(vector.y, 5);
        });

        it("Should create a vector from two numbers.", () => {
            const vector = new Vector2(5, 6);

            assert.strictEqual(vector.x, 5);
            assert.strictEqual(vector.y, 6);
        });

        it("Should create a vector from a tuple", () => {
            const vector = new Vector2([9, 7]);

            assert.strictEqual(vector.x, 9);
            assert.strictEqual(vector.y, 7);
        });

        it("Should create a vector from another vector.", () => {
            const first = new Vector2(5, 6);
            const second = new Vector2(first);

            assert.notStrictEqual(first, second);
            assert.strictEqual(second.x, 5);
            assert.strictEqual(second.y, 6);
        });

        it("Should create a vector from an object.", () => {
            const vector = new Vector2({
                x: 5,
                y: 6,
            });

            assert.strictEqual(vector.x, 5);
            assert.strictEqual(vector.y, 6);
        });
    });

    describe("Vector2#Deserialize", () => {
        it("Should create a vector from deserializing a buffer.", () => {
            const reader = HazelReader.from("257d6186", "hex");
            const vector = Vector2.Deserialize(reader);

            assert.strictEqual(vector.x, -1.1146715495536768);
            assert.strictEqual(vector.y, 2.492561226825366);
        });
    });

    describe("Vector2#Serialize", () => {
        it("Should write a vector to a buffer.", () => {
            const writer = HazelWriter.alloc(4);
            const vector = new Vector2(-1.11467154955367685, 2.492561226825366);

            vector.Serialize(writer);

            assert.strictEqual(writer.toString("hex"), "257d6186");
        });
    });

    describe("Vector2#toString", () => {
        it("Should display the vector as a string.", () => {
            const vector = new Vector2(5, 6);

            assert.strictEqual(vector.toString(), "(5, 6)");
        });
    });

    describe("Vector2#[util.inspect.custom]", () => {
        it("Should display the vector as a string with values rounded to 2 decimal places.", () => {
            const vector = new Vector2(5, 6);

            assert.strictEqual(
                vector[Symbol.for("nodejs.util.inspect.custom")](),
                "(5.00, 6.00)"
            );
        });
    });

    describe("Vector2#add", () => {
        it("Should add two vectors together.", () => {
            const a = new Vector2(65, 4);
            const b = new Vector2(3, 9);

            const c = Vector2.add(a, b);

            assert.strictEqual(c.x, 68);
            assert.strictEqual(c.y, 13);
        });
    });

    describe("Vector2#sub", () => {
        it("Should subtract a vector from another.", () => {
            const a = new Vector2(65, 4);
            const b = new Vector2(3, 9);

            const c = Vector2.sub(a, b);

            assert.strictEqual(c.x, 62);
            assert.strictEqual(c.y, -5);
        });
    });

    describe("Vector2#mul", () => {
        it("Should multiply a vector by another vector.", () => {
            const a = new Vector2(5, 6);
            const b = new Vector2(3, 2);

            const c = Vector2.mul(a, b);

            assert.strictEqual(c.x, 15);
            assert.strictEqual(c.y, 12);
        });

        it("Should scale a vector by a scalar.", () => {
            const a = new Vector2(5, 6);

            const c = Vector2.mul(a, 3);

            assert.strictEqual(c.x, 15);
            assert.strictEqual(c.y, 18);
        });
    });

    describe("Vector2#div", () => {
        it("Should divide a vector by another vector.", () => {
            const a = new Vector2(15, 12);
            const b = new Vector2(3, 2);

            const c = Vector2.div(a, b);

            assert.strictEqual(c.x, 5);
            assert.strictEqual(c.y, 6);
        });

        it("Should divide a vector by a scalar.", () => {
            const a = new Vector2(15, 18);

            const c = Vector2.div(a, 3);

            assert.strictEqual(c.x, 5);
            assert.strictEqual(c.y, 6);
        });
    });

    describe("Vector2#dist", () => {
        it("Should calculate the distance between two vectors.", () => {
            const a = new Vector2(3, 3);
            const b = new Vector2(6, 7);

            const dist = Vector2.dist(a, b);
            assert.strictEqual(dist, 5);
        });
    });

    describe("Vector2#clamp", () => {
        it("Should clamp a value between a minimum and maximum.", () => {
            assert.strictEqual(Vector2.clamp(50, 0, 100), 50);
            assert.strictEqual(Vector2.clamp(-25, 0, 100), 0);
            assert.strictEqual(Vector2.clamp(54368725674985, 0, 100), 100);
        });
    });

    describe("Vector2#lerp", () => {
        it("Should lerp a value between 0 and 1 to between a minimum and maximum.", () => {
            assert.strictEqual(Vector2.lerp(0.9), 40);
            assert.strictEqual(Vector2.lerp(0.9, -30, 30), 24);
        });
    });

    describe("Vector2#unlerp", () => {
        it("Should lerp a value between a minimum and maximum to a value between 0 and 1.", () => {
            assert.strictEqual(Vector2.unlerp(0), 0.5);
            assert.strictEqual(Vector2.unlerp(0, -15, 25), 0.375);
        });
    });
});
