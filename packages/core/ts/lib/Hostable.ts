import {
    Packet,
    GameDataMessage
} from "@skeldjs/protocol"

import { TypedEmitter, TypedEvents } from "@skeldjs/util";

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Hostable<T extends TypedEvents = {}> extends TypedEmitter<T> {
    options: any;
    clientid: number;
    stream: GameDataMessage[];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async send(packet: Packet, waitAck: boolean = true): Promise<number> { return 0; }
}