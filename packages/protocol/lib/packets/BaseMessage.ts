import { HazelReader, HazelWriter } from "@skeldjs/util";
import { PacketDecoder } from "../PacketDecoder";

export enum MessageDirection {
    Clientbound,
    Serverbound
}

export class BaseMessage {
    static tag: number;
    readonly tag: number;

    constructor(tag: number) {
        this.tag = tag;
    }

    static Deserialize(direction: MessageDirection, reader: HazelReader, decoder: PacketDecoder) {
        void reader, direction, decoder;
    }

    Serialize(direction: MessageDirection, writer: HazelWriter, decoder: PacketDecoder) {
        void writer, direction, decoder;
    }
}
