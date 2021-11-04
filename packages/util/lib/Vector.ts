import { HazelReader } from "./HazelReader";
import { HazelWriter } from "./HazelWriter";

/**
 * Represents a 2D vector in Among Us, i.e. a position or velocity.
 */
export class Vector2 {
    /**
     * The X coordinate of the vector.
     */
    x: number;

    /**
     * The Y coordinate of the vector.
     */
    y: number;

    /**
     * Add two vectors together
     * @param a The first vector.
     * @param b The second vector.
     * @returns A new vector with the two vectors added together.
     * @example
     * ```ts
     * const a = new Vector2(5, 8);
     * const b = new Vector2(3, 7);
     *
     * const c = Vector2.add(a, b);
     * console.log(c); // => (8, 15)
     * ```
     */
    static add(a: Vector2, b: Vector2) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    /**
     * Subtract one vector from another.
     * @param a The first vector.
     * @param b The second vector.
     * @returns A new vector with the second vector subtracted from the first.
     * @example
     * ```ts
     * const a = new Vector2(9, 9);
     * const b = new Vector2(3, 3);
     *
     * const c = Vector2.sub(a, b);
     * console.log(c); // => (6, 6)
     * ```
     */
    static sub(a: Vector2, b: Vector2) {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    /**
     * Multiply one vector with another.
     * @param a The first vector.
     * @param b The second vector.
     * @returns A new vector with the two vectors multiplied together.
     * @example
     * ```ts
     * const a = new Vector2(2, 9);
     * const b = new Vector2(2, 9);
     *
     * const c = Vector2.mul(a, b);
     * console.log(c); // => (4, 81)
     * ```
     */
    static mul(a: Vector2, b: Vector2): Vector2;
    /**
     * Scale a vector with a scalar.
     * @param a The vector to scale.
     * @param b The scalar.
     * @returns A new vector with the vector scaled by the scalar.
     * @example
     * ```ts
     * const a = new Vector(5, 4);
     * const c = Vector2.mul(a, 8);
     * console.log(c); // => (40, 32)
     * ```
     */
    static mul(a: Vector2, b: number): Vector2;
    static mul(a: Vector2, b: Vector2 | number) {
        if (typeof b === "number") {
            return new Vector2(a.x * b, a.y * b);
        }

        return new Vector2(a.x * b.x, a.y * b.y);
    }

    /**
     * Divide one vector from another.
     * @param a The first vector.
     * @param b The second vector.
     * @returns A new vector with one vector divided by the other.
     * @example
     * ```ts
     * const a = new Vector2(4, 81);
     * const b = new Vector2(2, 9);
     *
     * const c = Vector2.div(a, b);
     * console.log(c); // => (2, 9)
     * ```
     */
    static div(a: Vector2, b: Vector2): Vector2;
    /**
     * Divide a vector by a scalar value.
     * @param a The vector to scale.
     * @param b The scalar.
     * @returns A new vector with the vector scaled by the scalar.
     * @example
     * ```ts
     * const a = new Vector(40, 32);
     * const c = Vector2.div(a, 8);
     * console.log(c); // => (5, 4)
     * ```
     */
    static div(a: Vector2, b: number): Vector2;
    static div(a: Vector2, b: Vector2 | number) {
        if (typeof b === "number") {
            return new Vector2(a.x / b, a.y / b);
        }

        return new Vector2(a.x / b.x, a.y / b.y);
    }

    /**
     * Calculate the distance between one vector and another.
     * @param a The first vector.
     * @param b The second vector.
     * @returns The distance between the two vectors.
     * @example
     * ```ts
     * const a = new Vector(3, 3);
     * const b = new Vector(6, 7);
     *
     * const dist = Vector2.dist(a, b);
     * console.log(dist); // => 5
     * ```
     */
    static dist(a: Vector2, b: Vector2) {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    }

    static rotate(a: Vector2, radians: number) {
        const out = new Vector2;
        out.x = a.x * Math.cos(radians) - a.y * Math.sin(radians);
        out.y = a.x * Math.sin(radians) + a.y * Math.cos(radians);
        return out;
    }

    static rotateDeg(a: Vector2, degrees: number) {
        return this.rotate(a, (degrees * Math.PI) / 180);
    }

    static normalize(a: Vector2) {
        const dist = a.dist(Vector2.null);
        return a.div(dist);
    }

    static negate(a: Vector2) {
        return new Vector2(0 - a.x, 0 - a.y);
    }

    /**
     * Clamp a value between a minimum and a maximum.
     * @param val The value to clamp.
     * @param min The minimum value.
     * @param max The maximum value.
     * @returns The clamped value.
     * @example
     * ```ts
     * console.log(Vector2.clamp(50, 0, 100)); // => 50
     * console.log(Vector2.clamp(125, 0, 100)); // => 100
     * console.log(Vector2.clamp(-50, 0, 100)); // => 0
     * ```
     */
    static clamp(val: number, min: number, max: number) {
        if (val > max) {
            return max;
        }

        if (val < min) {
            return min;
        }

        return val;
    }

    /**
     * Map a value between 0 and 1 to between a minimum and maximum value.
     * @param val The value to lerp.
     * @param min The minimum value to lerp from.
     * @param max The maximum value to lerp to.
     * @returns The lerped value.
     * @example
     * ```ts
     * console.log(Vector2.lerp(0.9)); // => 40
     * console.log(Vector2.lerp(0.9, -30, 30)); // => 24
     * ```
     */
    static lerp(val: number, min: number = -50, max: number = 50) {
        if (!isFinite(min)) return max;
        if (!isFinite(max)) return min;

        const clamped = Vector2.clamp(val, 0, 1);

        return min + (max - min) * clamped;
    }

    /**
     * Map a value between a minimum and maximum value to between 0 and 1.
     * @param val The value to unlerp.
     * @param min The minimum value to unlerp from.
     * @param max The maximum value to unlerp to.
     * @returns The unlerped value.
     * @example
     * ```ts
     * console.log(Vector2.unlerp(0)); // => 0.5
     * console.log(Vector2.unlerp(0, -15, 25)); // => 0.375
     * ```
     */
    static unlerp(val: number, min: number = -50, max: number = 50) {
        return (val - min) / (max - min);
    }

    /**
     * A null vector.
     * @example
     * ```ts
     * console.log(Vector2.null); // => (0, 0)
     * ```
     */
    static get null() {
        return new Vector2(0, 0);
    }

    static get up() {
        return new Vector2(0, 1);
    }

    static get down() {
        return new Vector2(0, -1);
    }

    static get left() {
        return new Vector2(-1, 0);
    }

    static get right() {
        return new Vector2(1, 0);
    }

    /**
     * Create a 2D Vector from two numbers.
     * @param x X coordinate of the vector.
     * @param y Y coordinate of the vector. Leave out to use the same value as x.
     * @example
     * ```ts
     * const vector = new Vector2(62, 50);
     * ```
     */
    constructor(x?: number, y?: number);
    /**
     * Create a 2D vector from a number tuple.
     * @param pos The X and Y coordinates of the vector.
     * @example
     * ```ts
     * const vector = new Vector2([ 60, 70 ]);
     * ```
     */
    constructor(pos: [number, number]);
    /**
     * Create a 2D vector from another 2D vector, cloning it.
     * @param other The vector to clone.
     * @example
     * ```ts
     * const vector = new Vector2(62, 50);
     * const other = new Vector2(other);
     * ```
     */
    constructor(other: Vector2);
    /**
     * Create a 2D vector from an object containing an x and y property.
     * @param pos The object to create from.
     * @example
     * ```ts
     * const vector = new Vector2({
     *   x: 50,
     *   y: 20
     * });
     * ```
     */
    constructor(pos: { x: number; y: number });
    constructor(
        x?: number | [number, number] | Vector2 | { x: number; y: number },
        y?: number
    ) {
        if (typeof x === "undefined") {
            this.x = 0;
            this.y = 0;
        } else if (typeof x === "number") {
            this.x = x;
            this.y = typeof y === "number" ? y : x;
        } else if (Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
        } else {
            this.x = x.x;
            this.y = x.y;
        }
    }

    static Deserialize(reader: HazelReader) {
        return reader.vector();
    }

    Serialize(writer: HazelWriter) {
        writer.vector(this);
    }

    /**
     * Convert the vector into a string.
     * @returns The vector as a string.
     * @example
     * ```ts
     * const vector = new Vector2(5, 6);
     *
     * console.log(vector.toString()); // => (5, 6)
     * ```
     */
    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }

    [Symbol.for("nodejs.util.inspect.custom")]() {
        return "(" + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ")";
    }

    add(b: Vector2) {
        return Vector2.add(this, b);
    }

    sub(b: Vector2) {
        return Vector2.add(this, b);
    }

    mul(b: Vector2): Vector2;
    mul(b: number): Vector2;
    mul(b: Vector2 | number) {
        if (typeof b === "number") { // typescript sucks
            return Vector2.mul(this, b);
        }
        return Vector2.mul(this, b);
    }

    div(b: Vector2): Vector2;
    div(b: number): Vector2;
    div(b: Vector2 | number) {
        if (typeof b === "number") { // typescript sucks
            return Vector2.div(this, b);
        }
        return Vector2.div(this, b);
    }

    dist(b: Vector2) {
        return Vector2.dist(this, b);
    }

    rotate(radians: number) {
        return Vector2.rotate(this, radians);
    }

    rotateDeg(degrees: number) {
        return Vector2.rotateDeg(this, degrees);
    }

    normalize() {
        return Vector2.normalize(this);
    }

    negate() {
        return Vector2.negate(this);
    }

    clone() {
        return new Vector2(this);
    }
}
