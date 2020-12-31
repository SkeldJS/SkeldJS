import { HazelBuffer } from "@skeldjs/util"
import { SpawnID } from "@skeldjs/constant";

import {
    VoteState,
    PlayerVoteState
} from "@skeldjs/types"

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { Room } from "../Room";

export interface MeetingHudData {
    dirtyBit: number;
    players: Map<number, PlayerVoteState>;
}

export class MeetingHud extends Networkable<Global> {
    static type = SpawnID.MeetingHud as const;
    type = SpawnID.MeetingHud as const;

    static classname = "MeetingHud" as const;
    classname = "MeetingHud" as const;
    
    dirtyBit: number;
    players: Map<number, PlayerVoteState>;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|MeetingHudData) {
        super(room, netid, ownerid, data);
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.players = new Map;

            for (let i = 0; i < this.players.size; i++) {
                this.players.set(i, MeetingHud.readPlayerState(reader));
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < this.players.size; i++) {
                if (mask & (1 << i)) {
                    this.players.set(i, MeetingHud.readPlayerState(reader));
                }
            }
        }
    }

    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            for (const [ , player ] of this.players) {
                writer.upacked(player.state);
            }
        } else {
            writer.upacked(this.dirtyBit);

            for (const [ playerId, player ] of this.players) {
                if (this.dirtyBit & (1 << playerId)) {
                    writer.upacked(player.state);
                }
            }
        }
    }

    static readPlayerState(reader: HazelBuffer): PlayerVoteState {
        const voteState = {
            state: reader.byte(),
            get voted() {
                return (this.state & VoteState.VotedFor) - 1
            }
        }

        return voteState;
    }
}