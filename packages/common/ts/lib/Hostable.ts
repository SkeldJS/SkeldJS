import { EventEmitter } from "events";

import {
    Packet,
    GameDataMessage
} from "@skeldjs/protocol"

export abstract class Hostable extends EventEmitter {
    options: { allowHost: boolean };
    clientid: number;
    stream: GameDataMessage[];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async send(packet: Packet, waitAck: boolean = true): Promise<number> { return 0; }
}