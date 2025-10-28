import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";
import { MushroomMixupState } from "@skeldjs/constant";

export class PlayerMixupDataMessage extends BaseDataMessage {
    constructor(
        public readonly playerId: number,
        public readonly colorOfPlayerId: number,
        public readonly hatIdx: number,
        public readonly visorIdx: number,
        public readonly skinIdx: number,
        public readonly petIdx: number,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): PlayerMixupDataMessage {
        const playerId = reader.uint8();
        const colorOfPlayerId = reader.uint8();
        const hatIdx = reader.uint8();
        const visorIdx = reader.uint8();
        const skinIdx = reader.uint8();
        const petIdx = reader.uint8();
        return new PlayerMixupDataMessage(playerId, colorOfPlayerId, hatIdx, visorIdx, skinIdx, petIdx);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.playerId);
        writer.uint8(this.colorOfPlayerId);
        writer.uint8(this.hatIdx);
        writer.uint8(this.visorIdx);
        writer.uint8(this.skinIdx);
        writer.uint8(this.petIdx);
    }

    clone(): PlayerMixupDataMessage {
        return new PlayerMixupDataMessage(this.playerId, this.colorOfPlayerId, this.hatIdx, this.visorIdx, this.skinIdx, this.petIdx);
    }
}

export class MushroomMixupSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly state: MushroomMixupState,
        public readonly secondsUntilHeal: number,
        public readonly mixups: PlayerMixupDataMessage[]
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): MushroomMixupSystemDataMessage {
        const state = reader.uint8();
        const secondsUntilHeal = reader.float();
        const numMixups = reader.uint8();
        const message = new MushroomMixupSystemDataMessage(state, secondsUntilHeal, []);
        for (let i = 0; i < numMixups; i++) {
            message.mixups.push(PlayerMixupDataMessage.deserializeFromReader(reader));
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.state);
        writer.float(this.secondsUntilHeal);
        writer.uint8(this.mixups.length);
        for (const mixup of this.mixups) {
            mixup.serializeToWriter(writer);
        }
    }

    clone(): MushroomMixupSystemDataMessage {
        return new MushroomMixupSystemDataMessage(this.state, this.secondsUntilHeal, this.mixups.map(x => x.clone()));
    }
}