import { HazelBuffer } from "./HazelBuffer";

export interface Vector2 {
    x: number;
    y: number;
}

export function clampValue(val: number, min: number, max: number) {
    if (val > max) {
        return max;
    }

    if (val < min) {
        return min;
    }

    return val;
}

export function lerpValue(val: number, min: number = -40, max: number = 40) {
    if (!isFinite(min)) return max;
    if (!isFinite(max)) return min;

    const clamped = clampValue(val, 0, 1);

    return min + (max - min) * clamped;
}

export function unlerpValue(val: number, min: number = -40, max: number = 40) {
    return (val - min) / (max - min);
}

export function writeVector2(writer: HazelBuffer, vector: Vector2) {
    const x = unlerpValue(vector.x) * 65535;
    const y = unlerpValue(vector.y) * 65535;

    writer.uint16(x);
    writer.uint16(y);
}

export function readVector2(reader: HazelBuffer): Vector2 {
    const x = reader.uint16();
    const y = reader.uint16();

    return {
        x: lerpValue(x / 65535),
        y: lerpValue(y / 65535)
    }
}