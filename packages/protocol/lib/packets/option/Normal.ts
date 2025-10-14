import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRootPacket } from "./BaseRootPacket";
import { UnknownRootMessage } from "../normal/Unknown";
import { BaseRootMessage } from "../normal";

export abstract class NormalPacket extends BaseRootPacket {
    constructor(public readonly messageTag: number, public readonly children: BaseRootMessage[]) {
        super(messageTag);
    }

    static deserializeChildrenFromReader(reader: HazelReader) {
        const children: UnknownRootMessage[] = [];
        while (reader.left) {
            const [ tag, dataReader ] = reader.message();
            children.push(new UnknownRootMessage(tag, dataReader));
        }
        return children;
    }

    serializeToWriter(writer: HazelWriter): void {
        for (const child of this.children) {
            writer.begin(child.messageTag);
            writer.write(child);
            writer.end();
        }
    }
}