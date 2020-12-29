export function unary(func: (...args: any[]) => any) {
    return single => func(single);
}