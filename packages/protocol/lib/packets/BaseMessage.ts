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

    static deserializeFromReader(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        throw new Error("No deserialize method implemented");
    }

    serializeToWriter(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {

    }

    clone(): BaseMessage {
        throw new Error("No clone method implemented");
    }

    cancel() {
        this._canceled = true;
    }
}
