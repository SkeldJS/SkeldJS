import { EventEmitter } from "events";

import {
    Packet,
    GameDataMessage
} from "@skeldjs/protocol"

export abstract class Hostable extends EventEmitter {
    clientid: number;
    stream: GameDataMessage[];
    async send(packet: Packet, waitAck: boolean = true): Promise<number> { packet; waitAck; return 0; };
}