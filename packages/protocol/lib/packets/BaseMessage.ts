import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../PacketDecoder";

export class BaseMessage {
    static messageType: string;
    static messageTag: number;

    readonly messageType!: string;
    readonly messageTag!: number;

    private _canceled: boolean;

    constructor() {
        this._canceled = false;
    }

    get canceled() {
        return this._canceled;  
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        void reader, direction, decoder;
        return new BaseMessage;
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        void writer, direction, decoder;
    }

    cancel() {
        this._canceled = true;
    }
}
