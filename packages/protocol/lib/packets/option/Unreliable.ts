import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { NormalPacket } from "./Normal";
import { TaggedCloneable } from "../TaggedCloneable";
import { BaseRootMessage } from "../normal";

export class UnreliablePacket extends NormalPacket {
    static messageTag = SendOption.Unreliable;

    constructor(public readonly children: BaseRootMessage[]) {
        super(UnreliablePacket.messageTag, children);
    }

    static deserializeFromReader(reader: HazelReader) {
        const children = super.deserializeChildrenFromReader(reader);
        return new UnreliablePacket(children);
    }

    serializeToWriter(writer: HazelWriter) {
        super.serializeToWriter(writer);
    }
    
    clone(): TaggedCloneable {
        return new UnreliablePacket(this.children.map(child => child.clone()));
    }
}