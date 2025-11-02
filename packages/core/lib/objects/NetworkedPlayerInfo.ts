import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import {
    SpawnType,
    Color,
    PlayerDataFlags,
    PlayerOutfitType,
    RoleTeamType,
    RpcMessageTag
} from "@skeldjs/au-constants";

import { BaseSystemMessage, BaseRpcMessage, NetworkedPlayerInfoDataMessage, OutfitDataMessage, RpcMessage, SetTasksMessage, TaskStateDataMessage } from "@skeldjs/au-protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { StatefulRoom } from "../StatefulRoom";


import { BaseRole, CrewmateRole, UnknownRole } from "../roles";

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
    ) { }
}

/**
 * Specifically represents a set of cosmetics for a player, this is used as a
 * layering system to also show what cosmetics the player if they have shapeshifted
 * into another player.
 */
export class PlayerOutfit {
    hatSequenceId: number;
    petSequenceId: number;
    skinSequenceId: number;
    visorSequenceId: number;
    nameplateSequenceId: number;

    constructor(
        public outfitType: PlayerOutfitType,
        public name: string,
        public color: Color,
        public hatId: string,
        public petId: string,
        public skinId: string,
        public visorId: string,
        public nameplateId: string
    ) {
        this.hatSequenceId = 0;
        this.petSequenceId = 0;
        this.skinSequenceId = 0;
        this.visorSequenceId = 0;
        this.nameplateSequenceId = 0;
    }

    get isIncomplete() {
        return this.name === ""
            || this.hatId === "missing"
            || this.petId === "missing"
            || this.skinId === "missing"
            || this.visorId === "missing"
            || this.name === "missing";
    }

    static createDefault(outfitType: PlayerOutfitType) {
        return new PlayerOutfit(outfitType, "", Color.Red, "missing", "missing", "missing", "missing", "missing");
    }

    static deserializeFromReader(reader: HazelReader, type: PlayerOutfitType) {
        const outfit = new PlayerOutfit(type, "", Color.Red, "missing", "mising", "missing", "missing", "missing");
        outfit.name = reader.string();
        outfit.color = reader.packed();
        outfit.hatId = reader.string();
        outfit.petId = reader.string();
        outfit.skinId = reader.string();
        outfit.visorId = reader.string();
        outfit.nameplateId = reader.string();
        outfit.hatSequenceId = reader.uint8();
        outfit.petSequenceId = reader.uint8();
        outfit.skinSequenceId = reader.uint8();
        outfit.visorSequenceId = reader.uint8();
        outfit.nameplateSequenceId = reader.uint8();
        return outfit;
    }

    serializeToWriter(writer: HazelWriter) {
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

    nextHatSequenceId(): number {
        this.hatSequenceId++;
        if (this.hatSequenceId > 255) this.hatSequenceId = 0;
        return this.hatSequenceId;
    }

    nextPetSequenceId(): number {
        this.petSequenceId++;
        if (this.petSequenceId > 255) this.petSequenceId = 0;
        return this.petSequenceId;
    }

    nextSkinSequenceId(): number {
        this.skinSequenceId++;
        if (this.skinSequenceId > 255) this.skinSequenceId = 0;
        return this.skinSequenceId;
    }

    nextVisorSequenceId(): number {
        this.visorSequenceId++;
        if (this.visorSequenceId > 255) this.visorSequenceId = 0;
        return this.visorSequenceId;
    }

    nextNameplateSequenceId(): number {
        this.nameplateSequenceId++;
        if (this.nameplateSequenceId > 255) this.nameplateSequenceId = 0;
        return this.nameplateSequenceId;
    }
}

export type PlayerOutfits = Partial<Record<PlayerOutfitType, PlayerOutfit>>;

export type NetworkedPlayerInfoEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

export class NetworkedPlayerInfo<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, NetworkedPlayerInfoEvents<RoomType>> {
    currentOutfitType: PlayerOutfitType;
    playerId: number;
    clientId: number;
    /**
     * A collection of this player's outfits as they should be displayed.
     * Somewhat of a layer system, the Default outfit shouldn't be displayed
     * if there is another outfit in this object.
     */
    outfits: PlayerOutfits;
    /**
     * This player's level/rank.
     */
    playerLevel: number;
    /**
     * Any flags that this player has, see {@link PlayerDataFlags}.
     */
    flags: number;
    /**
     * Which role this player is. Note that this is not their actual instance
     * of this role, see {@link Player.role}, but is instead the class
     * used to create the instance, and holds metadata about the role, such as
     * the team it is for and whether it's a role for ghosts or not.
     *
     * You can use this to know what class {@link Player.role} will be an
     * instance of.
     * @example
     * ```ts
     * if (player.playerInfo.roleType === ImpostorRole) {
     *   player.role instanceof ImpostorRole // true
     * }
     * ```
     */
    roleType: typeof BaseRole;
    roleTypeWhenAlive: typeof BaseRole | null;
    /**
     * All of this player's tasks, and whether or not they have been completed
     * or not by the player.
     */
    taskStates: TaskState[];
    /**
     * The player's Innersloth friend code.
     */
    friendCode: string;
    /**
     * The player's global player UUID.
     */
    puid: string;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);

        this.currentOutfitType = PlayerOutfitType.Default;
        this.playerId ??= 0;
        this.clientId ??= 0;
        this.outfits ??= {
            [PlayerOutfitType.Default]: new PlayerOutfit(PlayerOutfitType.Default, "", Color.Red, "missing", "missing", "missing", "missing", "missing"),
        };
        this.playerLevel ??= 0;
        this.flags ??= 0;
        this.roleType ??= CrewmateRole;
        this.roleTypeWhenAlive ??= null;
        this.taskStates ??= [];
        this.friendCode ??= "";
        this.puid ??= "";
    }

    get owner() {
        return super.owner as RoomType;
    }

    /**
     * The player that this info is for.
     */
    getPlayer() {
        return this.room.getPlayerByPlayerId(this.playerId);
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

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
            case RpcMessageTag.SetTasks: return SetTasksMessage.deserializeFromReader(reader);  
        }
        return undefined;
    }
    
    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        if (rpc instanceof SetTasksMessage) return await this._handleSetTasks(rpc);
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }

    parseData(state: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update: return NetworkedPlayerInfoDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof NetworkedPlayerInfoDataMessage) {
            this.playerId = data.playerId;
            this.clientId = data.clientId;
            this.outfits = {};
            for (const outfit of data.outfits) {
                this.outfits[outfit.outfitType] = new PlayerOutfit(
                    outfit.outfitType,
                    outfit.name,
                    outfit.color,
                    outfit.hatId,
                    outfit.petId,
                    outfit.skinId,
                    outfit.visorId,
                    outfit.nameplateId,
                );
            }
            this.playerLevel = data.playerLevel;
            this.flags = data.flags;
            this.roleType = this.room.registeredRoles.get(data.roleType) || UnknownRole(data.roleType);
            if (data.roleTypeWhenAlive) {
                this.roleTypeWhenAlive = this.room.registeredRoles.get(data.roleTypeWhenAlive) || UnknownRole(data.roleTypeWhenAlive);
            } else {
                this.roleTypeWhenAlive = null;
            }
            this.taskStates = data.taskStates.map(taskState => new TaskState(taskState.taskIdx, taskState.completed));
            this.friendCode = data.friendCode;
            this.puid = data.puid;
        }
    }

    createData(state: DataState): BaseSystemMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update: return new NetworkedPlayerInfoDataMessage(
            this.playerId,
            this.clientId,
            Object.values(this.outfits).map(x =>
                new OutfitDataMessage(x.outfitType, x.name, x.color, x.hatId, x.petId, x.skinId, x.visorId, x.nameplateId, x.hatSequenceId, x.petSequenceId, x.skinSequenceId, x.visorSequenceId, x.nameplateSequenceId)),
            this.playerLevel,
            this.flags,
            this.roleType.roleMetadata.roleType || 0,
            this.roleTypeWhenAlive === null ? null : this.roleTypeWhenAlive.roleMetadata.roleType,
            this.taskStates.map(x => new TaskStateDataMessage(x.taskType, x.completed)),
            this.friendCode,
            this.puid,
        );
        }
        return undefined;
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
        this.pushDataState(DataState.Update);

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
        this.pushDataState(DataState.Update);
    }

    setName(outfitType: PlayerOutfitType, name: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.name = name;
        this.pushDataState(DataState.Update);
    }

    setColor(outfitType: PlayerOutfitType, color: Color) {
        const outfit = this.getOutfit(outfitType);
        outfit.color = color;
        this.pushDataState(DataState.Update);
    }

    setHat(outfitType: PlayerOutfitType, hatId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.hatId = hatId;
        this.pushDataState(DataState.Update);
    }

    setPet(outfitType: PlayerOutfitType, petId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.petId = petId;
        this.pushDataState(DataState.Update);
    }

    setSkin(outfitType: PlayerOutfitType, skinId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.skinId = skinId;
        this.pushDataState(DataState.Update);
    }

    setVisor(outfitType: PlayerOutfitType, visorId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.visorId = visorId;
        this.pushDataState(DataState.Update);
    }

    setNameplate(outfitType: PlayerOutfitType, nameplateId: string) {
        const outfit = this.getOutfit(outfitType);
        outfit.nameplateId = nameplateId;
        this.pushDataState(DataState.Update);
    }

    setLevel(level: number) {
        this.playerLevel = level;
        this.pushDataState(DataState.Update);
    }

    /**
     * Set the flags of this player.
     */
    setFlags(flags: number) {
        this.flags = flags;
        this.pushDataState(DataState.Update);
    }

    setRoleType(roleCtr: typeof BaseRole) {
        this.roleType = roleCtr;
        this.pushDataState(DataState.Update);
    }

    private async _handleSetTasks(rpc: SetTasksMessage) {
        // TODO: events

        this._setTasks(rpc.taskIds);
    }

    private _setTasks(taskIds: number[]) {
        this.taskStates = [];
        for (let i = 0; i < taskIds.length; i++) {
            const taskId = taskIds[i];
            this.taskStates.push(new TaskState(taskId, false));
        }
        this.pushDataState(DataState.Update);
    }

    private async _rpcSetTasks(taskIds: number[]) {
        this.room.broadcastLazy(new RpcMessage(
            this.netId,
            new SetTasksMessage(taskIds),
        ));
    }

    async setTasks(taskIds: number[]) {
        // TODO: events

        this._setTasks(taskIds);
        await this._rpcSetTasks(taskIds);
    }

    completeTask(taskIdx: number) {
        const taskState = this.taskStates[taskIdx];
        if (!taskState) return;

        taskState.completed = true;
        this.pushDataState(DataState.Update);
    }
}
