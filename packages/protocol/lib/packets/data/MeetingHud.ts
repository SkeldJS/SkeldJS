import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "./BaseDataMessage";

export class VoteAreaDataMessage extends BaseDataMessage {
    constructor(
        public readonly playerId: number,
        public readonly votedForId: number,
        public readonly didReport: boolean,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): VoteAreaDataMessage {
        const [ playerId, dataReader ] = reader.message();
        const votedForId = dataReader.uint8();
        const didReport = dataReader.bool();
        return new VoteAreaDataMessage(playerId, votedForId, didReport);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.begin(this.playerId);
        writer.uint8(this.votedForId);
        writer.bool(this.didReport);
        writer.end();
    }

    clone(): VoteAreaDataMessage {
        return new VoteAreaDataMessage(this.playerId, this.votedForId, this.didReport);
    }
}

export class MeetingHudDataMessage extends BaseDataMessage {
    constructor(public readonly voteStates: VoteAreaDataMessage[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): MeetingHudDataMessage {
        const numStates = reader.packed();
        const message = new MeetingHudDataMessage([]);
        for (let i = 0; i < numStates; i++) {
            message.voteStates.push(VoteAreaDataMessage.deserializeFromReader(reader));
        }
        return message;
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.packed(this.voteStates.length);
        for (const voteState of this.voteStates) {
            voteState.serializeToWriter(writer);
        }
    }

    clone(): MeetingHudDataMessage {
        return new MeetingHudDataMessage(this.voteStates.map(c => c.clone()));
    }
}