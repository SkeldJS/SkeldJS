import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class SecurityCameraSystemDataMessage extends BaseDataMessage {
    constructor(public readonly playerIds: number[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): SecurityCameraSystemDataMessage {
        const message = new SecurityCameraSystemDataMessage([]);
        const numPlayerIds = reader.upacked();
        for (let i = 0; i < numPlayerIds; i++) { // 32 for integer size, also probably maximum amount of doors
            message.playerIds.push(reader.uint8());
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.upacked(this.playerIds.length);
        for (const playerId of this.playerIds) writer.uint8(playerId);
    }

    clone(): SecurityCameraSystemDataMessage {
        return new SecurityCameraSystemDataMessage([...this.playerIds]);
    }
}