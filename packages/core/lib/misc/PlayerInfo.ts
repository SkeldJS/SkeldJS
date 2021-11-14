import { HazelReader, HazelWriter } from "@skeldjs/util";

import {
    Color,
    Hat,
    Nameplate,
    Pet,
    PlayerDataFlags,
    PlayerOutfitType,
    RoleType,
    Skin,
    Visor
} from "@skeldjs/constant";

import { GameData } from "../objects";
import { Hostable } from "../Hostable";

export class TaskState {
    constructor(
        public taskIdx: number,
        public completed: boolean
    ) {}

    static Deserialize(reader: HazelReader) {
        const task = new TaskState(0, false);
        task.Deserialize(reader);
        return task;
    }

    Deserialize(reader: HazelReader) {
        this.taskIdx = reader.upacked();
        this.completed = reader.bool();
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.taskIdx);
        writer.bool(this.completed);
    }
}

/**
 * Specifically represents a set of cosmetics for a player, this is used as a
 * layering system to also show what cosmetics the player if they have shapeshifted
 * into another player.
 */
export class PlayerOutfit {
    constructor(
        public outfitType: PlayerOutfitType,
        public name: string,
        public color: Color,
        public hatId: string,
        public petId: string,
        public skinId: string,
        public visorId: string,
        public nameplateId: string
    ) {}

    static createDefault(outfitType: PlayerOutfitType) {
        return new PlayerOutfit(outfitType, "", Color.Red, Hat.NoHat, Pet.EmptyPet, Skin.None, Nameplate.NoPlate, Visor.EmptyVisor);
    }

    static Deserialize(reader: HazelReader, type: PlayerOutfitType) {
        const name = reader.string();
        const color = reader.packed();
        const hatId = reader.string();
        const petId = reader.string();
        const skinId = reader.string();
        const visorId = reader.string();
        const nameplateId = reader.string();

        return new PlayerOutfit(type, name, color, hatId, petId, skinId, nameplateId, visorId);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.name);
        writer.packed(this.color);
        writer.string(this.hatId);
        writer.string(this.petId);
        writer.string(this.skinId);
        writer.string(this.visorId);
        writer.string(this.nameplateId);
    }

    clone(outfitType: PlayerOutfitType) {
        return new PlayerOutfit(
            outfitType,
            this.name,
            this.color,
            this.hatId,
            this.petId,
            this.skinId,
            this.visorId,
            this.nameplateId
        );
    }
}

export type PlayerOutfits = Partial<Record<PlayerOutfitType, PlayerOutfit>>;

/**
 * Represents information about a player, including any cosmetics they have equipped,
 * whether they are dead or the impostor, their role and whatever tasks they have.
 */
export class PlayerInfo<RoomType extends Hostable = Hostable> {
    constructor(
        public readonly gamedata: GameData<RoomType>,
        public readonly playerId: number,
        public outfits: PlayerOutfits,
        public playerLevel: number,
        public flags = 0,
        public roleType: RoleType,
        public taskIds: number[] = [],
        public taskStates: TaskState[] = []
    ) {}

    /**
     * The player that this info is for.
     */
    getPlayer() {
        return this.gamedata.room.getPlayerByPlayerId(this.playerId);
    }

    /**
     * Whether this player has been flagged as disconnected.
     */
    get isDisconnected() {
        return (this.flags & PlayerDataFlags.IsDisconnected)
            === PlayerDataFlags.IsDisconnected;
    }

    /**
     * Whether this player has been flagged as the impostor.
     */
    get isImpostor() {
        return (this.flags & PlayerDataFlags.IsImpostor)
            === PlayerDataFlags.IsImpostor;
    }

    /**
     * Whether this player has been flagged as dead.
     */
    get isDead() {
        return (this.flags & PlayerDataFlags.IsDead)
            === PlayerDataFlags.IsDead;
    }

    /**
     * Create a default player info object.
     * @param gamedata The gamedata object that this player information belongs to.
     * @param playerId The ID of the player.
     * @returns A default player info object.
     */
    static createDefault<RoomType extends Hostable = Hostable>(gamedata: GameData<RoomType>, playerId: number) {
        return new PlayerInfo(gamedata, playerId, {
            [PlayerOutfitType.Default]: PlayerOutfit.createDefault(PlayerOutfitType.Default)
        }, 0, 0, RoleType.Crewmate, [], []);
    }

    static Deserialize<RoomType extends Hostable = Hostable>(reader: HazelReader, gamedata: GameData<RoomType>, playerId: number) {
        const player = this.createDefault(gamedata, playerId);
        player.Deserialize(reader);
        return player;
    }

    Deserialize(reader: HazelReader) {
        this.outfits = {};
        const numOutfits = reader.uint8();
        for (let i = 0; i < numOutfits; i++) {
            const outfitType = reader.uint8() as PlayerOutfitType;
            this.outfits[outfitType] = reader.read(PlayerOutfit, outfitType);
        }
        this.playerLevel = reader.upacked();
        this.flags = reader.uint8();
        this.roleType = reader.uint16() as RoleType;
        this.taskStates = [];
        const num_tasks = reader.uint8();
        this.taskStates = reader.lread(num_tasks, TaskState);
    }

    Serialize(writer: HazelWriter) {
        const outfitVals = Object.values(this.outfits);
        writer.uint8(outfitVals.length);
        for (const outfit of outfitVals) {
            writer.uint8(outfit.outfitType);
            writer.write(outfit);
        }
        writer.upacked(this.playerLevel);
        writer.uint8(this.flags);
        writer.uint16(this.roleType);
        writer.uint8(this.taskStates?.length || 0);
        writer.lwrite(false, this.taskStates || []);
    }

    /**
     * Clone the player info for another player.
     */
    clone(playerId: number) {
        const clonedOutfits: PlayerOutfits = {};
        const outfitEntries = Object.values(this.outfits);
        for (const outfit of outfitEntries) {
            clonedOutfits[outfit.outfitType] = new PlayerOutfit(
                outfit.outfitType,
                outfit.name,
                outfit.color,
                outfit.hatId,
                outfit.petId,
                outfit.skinId,
                outfit.nameplateId,
                outfit.visorId
            );
        }

        return new PlayerInfo(
            this.gamedata,
            playerId,
            clonedOutfits,
            this.playerLevel,
            this.flags,
            this.roleType,
            [...this.taskIds],
            this.taskStates.map(task => new TaskState(task.taskIdx, task.completed))
        );
    }

    /**
     * Set whether this player is flagged as disconnected.
     */
    setDisconnected(isDisconnected: boolean) {
        if (isDisconnected) {
            this.setFlags(this.flags | PlayerDataFlags.IsDisconnected);
        } else {
            this.setFlags(this.flags & ~PlayerDataFlags.IsDisconnected);
        }
    }

    /**
     * Set whether this player is flagged as an impostor.
     */
    setImpostor(isImpostor: boolean) {
        if (isImpostor) {
            this.setFlags(this.flags | PlayerDataFlags.IsImpostor);
        } else {
            this.setFlags(this.flags & ~PlayerDataFlags.IsImpostor);
        }
    }

    /**
     * Set whether this player is flagged as dead.
     */
    setDead(isDead: boolean) {
        if (isDead) {
            this.setFlags(this.flags | PlayerDataFlags.IsDead);
        } else {
            this.setFlags(this.flags & ~PlayerDataFlags.IsDead);
        }
    }

    /**
     * Create or overwrite one of this player's outfits.
     * @param outfit The outfit to set
     */
    setOutfit(outfit: PlayerOutfit) {
        this.outfits[outfit.outfitType] = outfit;
        this.gamedata.update(this);
    }

    /**
     * Get an outfit from this player, or create it from the player's default base
     * outfit if it doesn't exist, or create a new one entirely if that doesn't
     * exist.
     * @param outfitType The outfit to get
     */
    getOutfit(outfitType: PlayerOutfitType) {
        const outfit = this.outfits[outfitType];
        if (outfit) {
            return outfit;
        }

        const defaultOutfit = this.outfits[PlayerOutfitType.Default];

        const newOutfit = defaultOutfit
            ? defaultOutfit.clone(outfitType)
            : PlayerOutfit.createDefault(outfitType);

        this.outfits[outfitType] = newOutfit;

        return newOutfit;
    }

    setName(outfitType: PlayerOutfitType, name: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.name = name;
        this.gamedata.update(this);
    }

    setColor(outfitType: PlayerOutfitType, color: Color) {
        const outfit = this.getOutfit(outfitType);
        outfit.color = color;
        this.gamedata.update(this);
    }

    setHat(outfitType: PlayerOutfitType, hatId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.hatId = hatId;
        this.gamedata.update(this);
    }

    setPet(outfitType: PlayerOutfitType, petId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.petId = petId;
        this.gamedata.update(this);
    }

    setSkin(outfitType: PlayerOutfitType, skinId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.skinId = skinId;
        this.gamedata.update(this);
    }

    setNameplate(outfitType: PlayerOutfitType, nameplateId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.nameplateId = nameplateId;
        this.gamedata.update(this);
    }

    setVisor(outfitType: PlayerOutfitType, visorId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.visorId = visorId;
        this.gamedata.update(this);
    }


    /**
     * Set the flags of this player.
     */
    setFlags(flags: number) {
        this.flags = flags;
        this.gamedata.update(this);
    }

    /**
     * Set the tasks of this player.
     * @param taskIds The IDs of each task.
     */
    setTaskIds(taskIds: number[]) {
        this.gamedata.setTasks(this, taskIds);
    }

    /**
     * Set the task states of this player.
     */
    setTaskStates(taskStates: TaskState[]) {
        this.taskStates = taskStates;
        this.gamedata.update(this);
    }

    /**
     * Mark a task of this player as completed.
     */
    completeTask(state: TaskState) {
        state.completed = true;
        this.gamedata.update(this);
    }
}
