export function isEmpty(obj) {
    if (typeof obj !== "object") return false;

    for (const _ in obj) { return false }
    
    return true;
}