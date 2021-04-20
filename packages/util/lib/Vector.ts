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

export function lerpValue(val: number, min: number = -50, max: number = 50) {
    if (!isFinite(min)) return max;
    if (!isFinite(max)) return min;

    const clamped = clampValue(val, 0, 1);

    return min + (max - min) * clamped;
}

export function unlerpValue(val: number, min: number = -50, max: number = 50) {
    return (val - min) / (max - min);
}
