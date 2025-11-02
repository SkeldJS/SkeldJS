import { SendOption } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { NormalPacket } from "./Normal";
import { TaggedCloneable } from "../TaggedCloneable";
import { BaseRootMessage } from "../normal";

export class ReliablePacket extends NormalPacket {
    static messageTag = SendOption.Reliable;

    constructor(public readonly nonce: number, public readonly children: BaseRootMessage[]) {
        super(ReliablePacket.messageTag, children);
    }

    static deserializeFromReader(reader: HazelReader) {
        const nonce = reader.uint16(true);
        const children = super.deserializeChildrenFromReader(reader);
        return new ReliablePacket(nonce, children);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        super.serializeToWriter(writer);
    }
    
    clone(): TaggedCloneable {
        return new ReliablePacket(this.nonce, this.children.map(child => child.clone()));
    }
}