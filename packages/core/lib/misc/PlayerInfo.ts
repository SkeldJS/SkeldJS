import { HazelReader, HazelWriter } from "@skeldjs/util";

import {
    Color,
    PlayerDataFlags,
    PlayerOutfitType,
    RoleTeamType
} from "@skeldjs/constant";

import { Hostable } from "../Hostable";
import { GameData } from "../objects";
import { BaseRole, UnknownRole } from "../roles";

export class TaskState {
    constructor(
        /**
         * The type of task that this task is, see {@link TaskType}. Not *necessarily*
         * available, although should be.
         */
        public taskType: number,
        /**
         * Whether or not this task has been completed or not by the player.
         */
        public completed: boolean
    ) {}
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

    get isIncomplete() {
        return this.name === ""
            || this.color === Color.Red
            || this.hatId === "missing"
            || this.petId === "missing"
            || this.skinId === "missing"
            || this.visorId === "missing"
            || this.name === "missing";
    }

    static createDefault(outfitType: PlayerOutfitType) {
        return new PlayerOutfit(outfitType, "", Color.Red, "missing", "missing", "missing", "missing", "missing");
    }

    static Deserialize(reader: HazelReader, type: PlayerOutfitType) {
        const name = reader.string();
        const color = reader.packed();
        const hatId = reader.string();
        const petId = reader.string();
        const skinId = reader.string();
        const visorId = reader.string();
        const nameplateId = reader.string();

        return new PlayerOutfit(type, name, color, hatId, petId, skinId, visorId, nameplateId);
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
    /**
     * Create a default player info object.
     * @param gamedata The gamedata object that this player information belongs to.
     * @param playerId The ID of the player.
     * @returns A default player info object.
     */
    static createDefault<RoomType extends Hostable = Hostable>(gamedata: GameData<RoomType>, playerId: number) {
        return new PlayerInfo(gamedata, playerId, {
            [PlayerOutfitType.Default]: PlayerOutfit.createDefault(PlayerOutfitType.Default)
        }, 0, 0, undefined, undefined, [], "", "");
    }

    currentOutfitType: PlayerOutfitType;

    constructor(
        public readonly gamedata: GameData<RoomType>,
        public readonly playerId: number,
        /**
         * A collection of this player's outfits as they should be displayed.
         * Somewhat of a layer system, the Default outfit shouldn't be displayed
         * if there is another outfit in this object.
         */
        public outfits: PlayerOutfits,
        /**
         * This player's level/rank.
         */
        public playerLevel: number,
        /**
         * Any flags that this player has, see {@link PlayerDataFlags}.
         */
        public flags = 0,
        /**
         * Which player this role is. Note that this is not their actual instance
         * of this role, see {@link PlayerData.role}, but is instead the class
         * used to create the instance, and holds metadata about the role, such as
         * the team it is for and whether it's a role for ghosts or not.
         *
         * You can use this to know what class {@link PlayerData.role} will be an
         * instance of.
         * @example
         * ```ts
         * if (player.playerInfo.roleType === ImpostorRole) {
         *   player.role instanceof ImpostorRole // true
         * }
         * ```
         */
        public roleType: typeof BaseRole|undefined,
        public roleTypeWhenAlive: typeof BaseRole|undefined,
        /**
         * All of this player's tasks, and whether or not they have been completed
         * or not by the player.
         */
        public taskStates: TaskState[] = [],
        /**
         * The player's Innersloth friend code.
         */
        public friendCode: string,
        /**
         * The player's global player UUID.
         */
        public puid: string
    ) {
        this.currentOutfitType = PlayerOutfitType.Default;
    }

    static Deserialize<RoomType extends Hostable = Hostable>(reader: HazelReader, gamedata: GameData<RoomType>, playerId: number) {
        const player = this.createDefault(gamedata, playerId);
        player.Deserialize(reader);
        return player;
    }

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
        if (!this.roleType)
            return false;

        return this.roleType.roleMetadata.roleTeam === RoleTeamType.Impostor;
    }

    /**
     * Whether this player has been flagged as dead.
     */
    get isDead() {
        return (this.flags & PlayerDataFlags.IsDead)
            === PlayerDataFlags.IsDead;
    }

    get defaultOutfit() {
        return this.getOutfit(PlayerOutfitType.Default);
    }

    get currentOutfit() {
        return this.getOutfit(this.currentOutfitType);
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
        const roleType = reader.uint16();
        this.roleType = this.gamedata.room.registeredRoles.get(roleType) || UnknownRole(roleType);
        this.taskStates = [];
        const numTasks = reader.uint8();
        for (let i = 0; i < numTasks; i++) {
            const taskIdx = reader.upacked();

            if (this.taskStates[taskIdx]) {
                this.taskStates[taskIdx].completed = reader.bool();
            } else {
                this.taskStates[taskIdx] = new TaskState(0, reader.bool());
            }
        }
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
        writer.uint16(this.roleType?.roleMetadata.roleType ? this.roleType.roleMetadata.roleType : 0);
        writer.bool(this.roleTypeWhenAlive !== undefined);
        if (this.roleTypeWhenAlive !== undefined) {
            writer.uint16(this.roleTypeWhenAlive.roleMetadata.roleType);
        }
        writer.uint8(this.taskStates.length);
        for (let i = 0; i < this.taskStates.length; i++) {
            writer.upacked(i);
            writer.bool(this.taskStates[i].completed);
        }
        writer.string(this.friendCode);
        writer.string(this.puid);
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
                outfit.visorId,
                outfit.nameplateId
            );
        }

        return new PlayerInfo(
            this.gamedata,
            playerId,
            clonedOutfits,
            this.playerLevel,
            this.flags,
            this.roleType,
            this.roleTypeWhenAlive,
            this.taskStates.map(task => new TaskState(task.taskType, task.completed)),
            this.friendCode,
            this.puid
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
     * @param outfit The outfit to set.
     */
    setOutfit(outfit: PlayerOutfit) {
        this.outfits[outfit.outfitType] = outfit;
        this.gamedata.markDirty(this);

        // todo outfit update events
    }

    /**
     * Get an outfit from this player, or create it from the player's default base
     * outfit if it doesn't exist, or create a new one entirely if that doesn't
     * exist.
     * @param outfitType The outfit to get.
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

    /**
     * Delete an outfit on this player.
     * @param outfitType the outfit to delete.
     */
    deleteOutfit(outfitType: PlayerOutfitType) {
        delete this.outfits[outfitType];
        if (this.currentOutfitType === outfitType) {
            this.currentOutfitType = PlayerOutfitType.Default;
        }
    }

    setName(outfitType: PlayerOutfitType, name: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.name = name;
    }

    setColor(outfitType: PlayerOutfitType, color: Color) {
        const outfit = this.getOutfit(outfitType);
        outfit.color = color;
    }

    setHat(outfitType: PlayerOutfitType, hatId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.hatId = hatId;
    }

    setPet(outfitType: PlayerOutfitType, petId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.petId = petId;
    }

    setSkin(outfitType: PlayerOutfitType, skinId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.skinId = skinId;
    }

    setVisor(outfitType: PlayerOutfitType, visorId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.visorId = visorId;
    }

    setNameplate(outfitType: PlayerOutfitType, nameplateId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.nameplateId = nameplateId;
    }


    /**
     * Set the flags of this player.
     */
    setFlags(flags: number) {
        this.flags = flags;
        this.gamedata.markDirty(this);
    }

    /**
     * Set the tasks of this player.
     * @param taskIds The IDs of each task.
     */
    async setTaskIds(taskIds: number[]) {
        await this.gamedata.setTasks(this, taskIds); // todo: player.settasks event
    }

    /**
     * Set the task states of this player.
     */
    setTaskStates(taskStates: TaskState[]) {
        this.taskStates = taskStates;
        this.gamedata.markDirty(this);
    }

    /**
     * Mark a task of this player as completed.
     */
    completeTask(state: TaskState) {
        state.completed = true;
        this.gamedata.markDirty(this);
    }
}
