import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { GameOptions } from "../../misc";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SyncSettingsMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.SyncSettings as const;
    tag = RpcMessageTag.SyncSettings as const;

    options: GameOptions;

    constructor(options: GameOptions) {
        super();

        this.options = options;
    }

    static Deserialize(reader: HazelReader) {
        const options = reader.read(GameOptions);

        return new SyncSettingsMessage(options);
    }

    Serialize(writer: HazelWriter) {
        writer.write(this.options);
    }
}
