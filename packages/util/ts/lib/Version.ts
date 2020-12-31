export interface VersionInfo {
    year: number;
    month: number;
    day: number;
    revision: number;
}

export function EncodeVersionInfo(info: VersionInfo) {
    return (info.year * 25000) +
        (info.month * 1800) +
        (info.day * 50) +
        info.revision;
}

export function EncodeVersion(year: number, month: number, day: number, revision: number) {
    return EncodeVersionInfo({ year, month, day, revision });
}

export function DecodeVersion(version: number) {
    const info: Partial<VersionInfo> = {}

    info.year = Math.floor(version / 25000);
    version %= 25000;
    info.month = Math.floor(version / 1800);
    version %= 1800;
    info.day = Math.floor(version / 50);
    info.revision = version % 50;

    return info as VersionInfo;
}

export function FormatVersionInfo(version: VersionInfo|number) {
    if (typeof version === "number") {
        return FormatVersionInfo(DecodeVersion(version));
    }

    return version.year + "." + version.month + "." + version.day + "." + version.revision;
}

export function FormatVersion(year: number, month: number, day: number, revision: number) {
    return year + "." + month + "." + day + "." + revision;
}