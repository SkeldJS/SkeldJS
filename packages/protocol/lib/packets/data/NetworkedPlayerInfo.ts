import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "./BaseDataMessage";
import { Color, PlayerOutfitType } from "@skeldjs/constant";

export class OutfitDataMessage extends BaseDataMessage {
    constructor(
        public readonly outfitType: PlayerOutfitType,
        public readonly name: string,
        public readonly color: Color,
        public readonly hatId: string,
        public readonly petId: string,
        public readonly skinId: string,
        public readonly visorId: string,
        public readonly nameplateId: string,
        public readonly hatSequenceId: number,
        public readonly petSequenceId: number,
        public readonly skinSequenceId: number,
        public readonly visorSequenceId: number,
        public readonly nameplateSequenceId: number,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): OutfitDataMessage {
        const outfitType = reader.uint8();
        const name = reader.string();
        const color = reader.packed();
        const hatId = reader.string();
        const petId = reader.string();
        const skinId = reader.string();
        const visorId = reader.string();
        const nameplateId = reader.string();
        const hatSequenceId = reader.uint8();
        const petSequenceId = reader.uint8();
        const skinSequenceId = reader.uint8();
        const visorSequenceId = reader.uint8();
        const nameplateSequenceId = reader.uint8();
        return new OutfitDataMessage(outfitType, name, color, hatId, petId, skinId, visorId, nameplateId, hatSequenceId, petSequenceId, skinSequenceId, visorSequenceId, nameplateSequenceId);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.outfitType);
        writer.string(this.name);
        writer.packed(this.color);
        writer.string(this.hatId);
        writer.string(this.petId);
        writer.string(this.skinId);
        writer.string(this.visorId);
        writer.string(this.nameplateId);
        writer.uint8(this.hatSequenceId);
        writer.uint8(this.petSequenceId);
        writer.uint8(this.skinSequenceId);
        writer.uint8(this.visorSequenceId);
        writer.uint8(this.nameplateSequenceId);
    }

    clone(): OutfitDataMessage {
        return new OutfitDataMessage(
            this.outfitType,
            this.name,
            this.color,
            this.hatId,
            this.petId,
            this.skinId,
            this.visorId,
            this.nameplateId,
            this.hatSequenceId,
            this.petSequenceId,
            this.skinSequenceId,
            this.visorSequenceId,
            this.nameplateSequenceId,
        );
    }
}

export class TaskStateDataMessage extends BaseDataMessage {
    constructor(public readonly taskIdx: number, public readonly completed: boolean) { super(); }

    static deserializeFromReader(reader: HazelReader): TaskStateDataMessage {
        const taskIdx = reader.upacked();
        const completed = reader.bool();
        return new TaskStateDataMessage(taskIdx, completed);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.upacked(this.taskIdx);
        writer.bool(this.completed);
    }

    clone(): TaskStateDataMessage {
        return new TaskStateDataMessage(this.taskIdx, this.completed);
    }
}

export class NetworkedPlayerInfoDataMessage extends BaseDataMessage {
    constructor(
        public readonly playerId: number,
        public readonly clientId: number,
        public readonly outfits: OutfitDataMessage[],
        public readonly playerLevel: number,
        public readonly flags: number,
        public readonly roleType: number,
        public readonly roleTypeWhenAlive: number|null,
        public readonly taskStates: TaskStateDataMessage[],
        public readonly friendCode: string,
        public readonly puid: string,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): NetworkedPlayerInfoDataMessage {
        const playerId = reader.uint8();
        const clientId = reader.packed();
        const numOutfits = reader.uint8();
        const outfits = [];
        for (let i = 0; i < numOutfits; i++) {
            outfits.push(OutfitDataMessage.deserializeFromReader(reader));
        }
        const playerLevel = reader.upacked();
        const flags = reader.uint8();
        const roleType = reader.uint16();
        const roleWhenAlive = reader.bool();
        var roleTypeWhenAlive: number|null = null;
        if (roleWhenAlive) {
            roleTypeWhenAlive = reader.uint16();
        }
        const numTaskStates = reader.uint8();
        const taskStates = [];
        for (let i = 0; i < numTaskStates; i++) {
            taskStates.push(TaskStateDataMessage.deserializeFromReader(reader));
        }
        const friendCode = reader.string();
        const puid = reader.string();
        return new NetworkedPlayerInfoDataMessage(
            playerId,
            clientId,
            outfits,
            playerLevel,
            flags,
            roleType,
            roleTypeWhenAlive,
            taskStates,
            friendCode,
            puid,
        );
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.playerId);
        writer.packed(this.clientId);
        const outfitVals = Object.values(this.outfits);
        writer.uint8(outfitVals.length);
        for (const outfit of outfitVals) writer.write(outfit);
        writer.upacked(this.playerLevel);
        writer.uint8(this.flags);
        writer.uint16(this.roleType);
        writer.bool(this.roleTypeWhenAlive !== null);
        if (this.roleTypeWhenAlive !== null) {
            writer.uint16(this.roleTypeWhenAlive);
        }
        writer.uint8(this.taskStates.length);
        for (let i = 0; i < this.taskStates.length; i++) {
            writer.upacked(i);
            writer.bool(this.taskStates[i].completed);
        }
        writer.string(this.friendCode);
        writer.string(this.puid);
    }

    clone(): NetworkedPlayerInfoDataMessage {
        return new NetworkedPlayerInfoDataMessage(
            this.playerId,
            this.clientId,
            [...this.outfits.map(x => x.clone())],
            this.playerLevel,
            this.flags,
            this.roleType,
            this.roleTypeWhenAlive,
            [...this.taskStates.map(x => x.clone())],
            this.friendCode,
            this.puid,
        );
    }
}