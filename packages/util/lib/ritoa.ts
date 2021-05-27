import dgram from "dgram";

export function ritoa<
    T extends { remote: dgram.RemoteInfo },
    U extends { address: string; port: number }
>(remote: T | U): string {
    if ((remote as T).remote) {
        return ritoa((remote as T).remote);
    }

    return `${(remote as U).address}:${(remote as U).port}`;
}
