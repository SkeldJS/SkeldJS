import dgram from "dgram"

export function ritoa<T extends { remote: dgram.RemoteInfo }>(remote: dgram.RemoteInfo|T) {
    if ((remote as T).remote) {
        return ritoa((remote as T).remote);
    }

    return `${(remote as dgram.RemoteInfo).address}:${(remote as dgram.RemoteInfo).port}`;
}