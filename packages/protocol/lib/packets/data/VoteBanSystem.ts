import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "./BaseDataMessage";
import { UnknownDataMessage } from "./Unknown";

export class BanVotesDataMessage extends BaseDataMessage {
    constructor(public readonly targetClientId: number, public readonly voterClientIds: [number, number, number]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): BanVotesDataMessage {
        const targetClientId = reader.upacked();
        const voter1 = reader.upacked();
        const voter2 = reader.upacked();
        const voter3 = reader.upacked();
        return new BanVotesDataMessage(targetClientId, [ voter1, voter2, voter3 ]);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.upacked(this.targetClientId);
        writer.upacked(this.voterClientIds[0]);
        writer.upacked(this.voterClientIds[1]);
        writer.upacked(this.voterClientIds[2]);
    }

    clone(): BanVotesDataMessage {
        return new BanVotesDataMessage(this.targetClientId, [...this.voterClientIds]);
    }
}

export class VoteBanSystemDataMessage extends BaseDataMessage {
    constructor(public readonly banVotes: BanVotesDataMessage[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): VoteBanSystemDataMessage {
        const banVotes = reader.list(listReader => BanVotesDataMessage.deserializeFromReader(listReader));
        return new VoteBanSystemDataMessage(banVotes);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.list(true, this.banVotes, banVotes => banVotes.serializeToWriter(writer));
    }

    clone(): VoteBanSystemDataMessage {
        return new VoteBanSystemDataMessage(this.banVotes.map(x => x.clone()));
    }
}