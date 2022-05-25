export function intToIpAddress(ip: number) {
    const a = (ip >> 24) & 0xff;
    const b = (ip >> 16) & 0xff;
    const c = (ip >> 8) & 0xff;
    const d = (ip) &  0xff;
    return a + "." + b + "." + c + "." + d;
}
