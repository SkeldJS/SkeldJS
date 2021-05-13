import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseReactorMessage } from "./BaseReactorMessage";
import { ReactorMessageTag } from "./ReactorMessage";

export enum PluginSide {
    Both,
    Clientside
}

export class ReactorModDeclarationMessage extends BaseReactorMessage {
    static tag = ReactorMessageTag.ModDeclaration as const;
    tag = ReactorMessageTag.ModDeclaration as const;

    netid: number;
    modid: string;
    version: string;
    side: PluginSide;

    constructor(
        netid: number,
        modid: string,
        version: string,
        side: PluginSide
    ) {
        super();

        this.netid = netid;
        this.modid = modid;
        this.version = version;
        this.side = side;
    }

    static Deserialize(reader: HazelReader) {
        const netid = reader.packed();
        const modid = reader.string();
        const version = reader.string();
        const side = reader.uint8();

        return new ReactorModDeclarationMessage(netid, modid, version, side);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.netid);
        writer.string(this.modid);
        writer.string(this.version);
        writer.uint8(this.side);
    }
}
