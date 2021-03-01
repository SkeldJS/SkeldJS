export function unary(func: (...args: any[]) => any, num = 1) {
    return (...passed) => func(...passed.slice(0, num));
}