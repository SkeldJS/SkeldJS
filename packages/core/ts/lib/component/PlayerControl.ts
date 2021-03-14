import { HazelBuffer } from "@skeldjs/util";
import { RpcMessage, GameOptions } from "@skeldjs/protocol";

import {
    ColorID,
    MessageTag,
    RpcTag,
    SpawnID,
    PetID,
    SkinID,
    HatID,
    ChatNoteType,
    TaskState,
} from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { PlayerDataResolvable, Hostable } from "../Hostable";

export interface PlayerControlData {
    isNew: boolean;
    playerId: number;
}

export interface PlayerControlEvents extends NetworkableEvents {
    /**
     * Emitted when the player completes one of their tasks.
     */
    "player.completetask": {
        /**
         * The task that the player completed.
         */
        task: TaskState;
    };
    /**
     * Emitted when the player sets their name.
     */
    "player.setname": {
        /**
         * The name of the player.
         */
        name: string;
    };
    /**
     * Emitted when a player sets their colour.
     */
    "player.setcolor": {
        /**
         * The colour of the player.
         */
        color: ColorID;
    };
    /**
     * Emitted when a player sets their hat.
     */
    "player.sethat": {
        /**
         * The hat of the player.
         */
        hat: HatID;
    };
    /**
     * Emitted when a player sets their skin.
     */
    "player.setskin": {
        /**
         * The skin of the player.
         */
        skin: SkinID;
    };
    /**
     * Emitted when a player sets their pet.
     */
    "player.setpet": {
        /**
         * The pet of the player.
         */
        pet: PetID;
    };
    /**
     * Emitted when the player syncs or updates game settings.
     */
    "player.syncsettings": {
        /**
         * The settings that were synced or updated.
         */
        settings: GameOptions;
    };
    /**
     * Emitted when the player changes the "Game starts in X" counter.
     */
    "player.setstartcounter": {
        /**
         * The current start counter.
         */
        counter: number;
    };
    /**
     * Emitted when the player sets the impostors for the game.
     */
    "player.setimpostors": {
        /**
         * The impostors that were set.
         */
        impostors: PlayerData[];
    };
    /**
     * Emitted when the player murders another player.
     */
    "player.murder": {
        /**
         * The victim that the player murdered.
         */
        victim: PlayerData;
    };
    /**
     * Emitted when the player starts a meeting.
     */
    "player.meeting": {
        /**
         * The body that was reported, or null if an emergency meeting was called.
         */
        body: PlayerData | null;
    };
    /**
     * Emitted when the player sends a message in chat.
     */
    "player.chat": {
        /**
         * The message that the player sent.
         */
        message: string;
    };
}

/**
 * Represents a player object for interacting with the game and other players.
 *
 * See {@link PlayerControlEvents} for events to listen to.
 */
export class PlayerControl extends Networkable<PlayerControlData, PlayerControlEvents> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "PlayerControl" as const;
    classname = "PlayerControl" as const;

    private lastStartCounter = 0;

    /**
     * Whether the player was just spawned, or was spawned before joining.
     */
    isNew: boolean;

    /**
     * The player ID of the player.
     */
    playerId: number;

    constructor(
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | PlayerControlData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.isNew = reader.bool();
        }

        this.playerId = reader.uint8();
    }

    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            writer.bool(this.isNew);
            this.isNew = false;
        }

        writer.uint8(this.playerId);
        return true;
    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.CompleteTask:
                this._completeTask(message.taskIdx);
                break;
            case RpcTag.SyncSettings:
                this._syncSettings(message.settings);
                break;
            case RpcTag.SetInfected:
                this._setInfected(message.impostors);
                break;
            case RpcTag.CheckName:
                if (this.room.amhost) {
                    if (!this.room.gamedata) {
                        return;
                    }

                    const players = [...this.room.gamedata.players.values()];
                    if (
                        players.some(
                            (player) =>
                                player.playerId !== this.playerId &&
                                player.name.toLowerCase() ===
                                    message.name.toLowerCase()
                        )
                    ) {
                        for (let i = 1; i < 100; i++) {
                            const new_name = message.name + " " + i;

                            if (
                                !players.some(
                                    (player) =>
                                        player.playerId !== this.playerId &&
                                        player.name.toLowerCase() ===
                                            new_name.toLowerCase()
                                )
                            ) {
                                this.setName(new_name);
                                return;
                            }
                        }
                    }

                    this.setName(message.name);
                }
                break;
            case RpcTag.CheckColor:
                if (this.room.amhost) {
                    if (!this.room.gamedata) {
                        return;
                    }

                    const players = [...this.room.gamedata.players.values()];
                    while (
                        players.some(
                            (player) =>
                                player.playerId !== this.playerId &&
                                player.color === message.color
                        )
                    ) {
                        message.color++;
                        if (message.color > 11) {
                            message.color = 0;
                        }
                    }

                    this.setColor(message.color);
                }
                break;
            case RpcTag.SetName:
                this._setName(message.name);
                break;
            case RpcTag.SetColor:
                this._setColor(message.color);
                break;
            case RpcTag.SetHat:
                this._setHat(message.hat);
                break;
            case RpcTag.SetSkin:
                this._setSkin(message.skin);
                break;
            case RpcTag.MurderPlayer:
                this._murderPlayer(message.victimid);
                break;
            case RpcTag.SendChat:
                this._chat(message.message);
                break;
            case RpcTag.StartMeeting:
                this._startMeeting(message.bodyid);
                break;
            case RpcTag.SetPet:
                this._setPet(message.pet);
                break;
            case RpcTag.SetStartCounter:
                this._setStartCounter(message.time);
                break;
        }
    }

    /**
     * Ask the host to check a name and modify it if required, e.g. appending numbers to the end).
     * @param name The name to check.
     * @example
	 *```typescript
     * // Set your name when you spawn.
     * client.me.on("player.spawn", ev => {
     *   player.control.checkName("weakeyes");
     * });
     * ```
	 */
    async checkName(name: string) {
        await this.room.broadcast(
            [
                {
                    tag: MessageTag.RPC,
                    netid: this.netid,
                    rpcid: RpcTag.CheckName,
                    name,
                },
            ],
            true,
            this.room.host
        );
    }

    /**
     * Ask the host to check a colour and change it if required, e.g. changing it if it's taken.
     * @param color The colour to check.
     * @example
	 *```typescript
     * // Set your colour when you spawn.
     * client.me.on("player.spawn", ev => {
     *   player.control.checkColour(ColorID.Blue);
     * });
     * ```
	 */
    async checkColor(color: ColorID) {
        await this.room.broadcast(
            [
                {
                    tag: MessageTag.RPC,
                    netid: this.netid,
                    rpcid: RpcTag.CheckColor,
                    color,
                },
            ],
            true,
            this.room.host
        );
    }

    private _completeTask(taskIdx: number) {
        if (this.room.gamedata) {
            this.room.gamedata.completeTask(this.playerId, taskIdx);

            if (this.owner.data && this.owner.data.tasks) {
                this.emit("player.completetask", {
                    task: this.owner.data.tasks[taskIdx],
                });
            }
        }
    }

    /**
     * Mark a task as complete.
     * @param taskIdx The index of the player's tasks to mark complete.
     * @example
	 *```typescript
     * // Complete all of a player's tasks.
     * for (let i = 0; i < player.data.tasks.length; i++) {
     *   player.control.completeTask(i);
     * }
     * ```
	 */
    completeTask(taskIdx: number) {
        this._completeTask(taskIdx);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.CompleteTask,
            netid: this.netid,
            taskIdx,
        });
    }

    private _murderPlayer(netid: number) {
        const resolved = this.room.getPlayerByNetID(netid);

        if (resolved) {
            this.emit("player.murder", { victim: resolved });
        }
    }

    /**
     * Murder a player as the Impostor.
     * @param victim The victim to murder.
     * @example
	 *```typescript
     * if (client.me.data.impostor) {
     *   client.me.murder(player)
     * }
     * ```
	 */
    murder(victim: PlayerDataResolvable) {
        const res_victim = this.room.resolvePlayer(victim);

        if (res_victim && res_victim.control) {
            this.room.stream.push({
                tag: MessageTag.RPC,
                rpcid: RpcTag.MurderPlayer,
                netid: this.netid,
                victimid: res_victim.control.netid,
            });
        }
    }

    private _setName(name: string) {
        if (this.room.gamedata) {
            this.room.gamedata.setName(this.playerId, name);

            this.emit("player.setname", { name });
        }
    }

    /**
     * Force set the name of the player.
     * @param name The name to set.
     * @example
	 *```typescript
     * // Set your name when you spawn.
     * client.me.on("player.spawn", ev => {
     *   player.control.setName("weakeyes");
     * });
     * ```
	 */
    setName(name: string) {
        this._setName(name);

        if (this.room.amhost) {
            this.room.stream.push({
                tag: MessageTag.RPC,
                rpcid: RpcTag.SetName,
                netid: this.netid,
                name,
            });
        }
    }

    private _setColor(color: ColorID) {
        if (this.room.gamedata) {
            this.room.gamedata.setColor(this.playerId, color);

            this.emit("player.setcolor", { color });
        }
    }

    /**
     * Force set the colour of the player.
     * @param color The colour to set.
     * @example
	 *```typescript
     * // Set your colour when you spawn.
     * client.me.on("player.spawn", ev => {
     *   player.control.setColor(ColorID.Blue);
     * });
     * ```
	 */
    setColor(color: ColorID) {
        this._setColor(color);

        if (this.room.amhost) {
            this.room.stream.push({
                tag: MessageTag.RPC,
                rpcid: RpcTag.SetColor,
                netid: this.netid,
                color,
            });
        }
    }

    private _setHat(hat: HatID) {
        if (this.room.gamedata) {
            this.room.gamedata.setHat(this.playerId, hat);

            this.emit("player.sethat", { hat });
        }
    }

    /**
     * Set the hat of the player.
     * @param hat The hat to set.
     * @example
	 *```typescript
     * player.control.setHat(HatID.Fez);
     * ```
	 */
    setHat(hat: HatID) {
        this._setHat(hat);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SetHat,
            netid: this.netid,
            hat,
        });
    }

    private _setSkin(skin: SkinID) {
        if (this.room.gamedata) {
            this.room.gamedata.setSkin(this.playerId, skin);

            this.emit("player.setskin", { skin });
        }
    }

    /**
     * Set the skin of the player.
     * @param skin The skin to set.
     * @example
	 *```typescript
     * player.control.setSkin(SkinID.Miner);
     * ```
	 */
    setSkin(skin: SkinID) {
        this._setSkin(skin);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SetSkin,
            netid: this.netid,
            skin,
        });
    }

    private _setPet(pet: PetID) {
        if (this.room.gamedata) {
            this.room.gamedata.setPet(this.playerId, pet);

            this.emit("player.setpet", { pet });
        }
    }

    /**
     * Set the pet of the player.
     * @param pet The pet to set.
     * @example
	 *```typescript
     * player.control.setPet(PetID.Robot);
     * ```
	 */
    setPet(pet: PetID) {
        this._setPet(pet);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SetPet,
            netid: this.netid,
            pet,
        });
    }

    private _chat(message: string) {
        this.emit("player.chat", { message });
    }

    /**
     * Type a message into the chat. Can be in {@link http://digitalnativestudios.com/textmeshpro/docs/rich-text TextMesh Pro} format.
     * @see {TMPElement}
     * @param message The message to send.
     * @example
	 *```typescript
     * player.control.chat("Hello!");
     * ```
	 */
    chat(message: string) {
        this._chat(message);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SendChat,
            netid: this.netid,
            message,
        });
    }

    /**
     * Send a chat note, currently only used for the "X voted for" message in chat.
     * @param type The type of chat note to send.
     * @example
	 *```typescript
     * player.control.sendChatNote(ChatNoteType.DidVote);
     * ```
	 */
    sendChatNote(type: ChatNoteType) {
        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SendChatNote,
            netid: this.netid,
            playerid: this.playerId,
            type: type,
        });
    }

    private _syncSettings(settings: GameOptions) {
        this.room.settings = settings;

        this.emit("player.syncsettings", { settings });
    }

    /**
     * Sync or update room settings with every client.
     * @param update_settings The settings to sync or update (Can be partial).
     * @example
	 *```typescript
     * player.control.syncSettings({
     *   crewmateVision: 1.25,
     *   votingTime: 60
     * });
     * ```
	 */
    syncSettings(update_settings: Partial<GameOptions> = this.room.settings) {
        const settings = {
            ...this.room.settings,
            ...update_settings,
        } as GameOptions;

        this._syncSettings(settings);

        this.room.stream.push({
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.SyncSettings,
            settings: settings,
        });
    }

    private _setStartCounter(counter: number) {
        this.lastStartCounter++;
        this.room.counter = counter;
        this.emit("player.setstartcounter", { counter });
    }

    /**
     * Set the "Game starting in X" counter.
     * @param counter The counter to set to.
     * @example
	 *```typescript
     * for (let i = 5; i > 0; i--) {
     *   player.control.setStartCounter(i);
     *   await sleep(1000);
     * }
     * ```
	 */
    setStartCounter(counter: number) {
        this._setStartCounter(counter);

        this.room.stream.push({
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.SetStartCounter,
            seqId: this.lastStartCounter,
            time: counter,
        });
    }

    private _setInfected(playerids: number[]) {
        const impostors: PlayerData[] = [];

        for (let i = 0; i < playerids.length; i++) {
            const playerid = playerids[i];

            const resolved = this.room.getPlayerByPlayerId(playerid);

            if (resolved) {
                impostors.push(resolved);

                if (resolved.data) {
                    resolved.data.impostor = true;
                }
            }
        }

        this.emit("player.setimpostors", { impostors });
    }

    /**
     * Set the impostors of the game.
     * @param players The players to set as the impostors.
     * @see {BaseShipStatus.selectInfected} for an example.
     */
    setInfected(players: PlayerDataResolvable[]) {
        const resolved = players
            .map((player) => this.room.resolvePlayer(player))
            .filter((_) => _);

        this._setInfected(resolved.map((player) => player.playerId));

        this.room.stream.push({
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.SetInfected,
            impostors: resolved.map((player) => player.playerId),
        });
    }

    private _startMeeting(bodyid: number) {
        this.emit("player.meeting", {
            body:
                bodyid === 0xff ? null : this.room.getPlayerByPlayerId(bodyid),
        });
    }

    /**
     * Immediately tart a meeting either for a reported body or for an emergency.
     * @param body Either the body to report or whether it was an emergency.
     * @see {PlayerControl.reportDeadBody} If the player is not the host.
     * @example
	 *```typescript
     * // Report a dead body.
     * client.me.control.startMeeting(player);
     *
     * // Call an emergency meeting.
     * client.me.control.startMeeting("emergency");
     * ```
	 */
    startMeeting(body: PlayerDataResolvable | "emergency") {
        const resolved =
            body === "emergency" ? null : this.room.resolvePlayer(body);

        if (resolved || body === "emergency") {
            this.room.stream.push({
                tag: MessageTag.RPC,
                netid: this.netid,
                rpcid: RpcTag.StartMeeting,
                bodyid: body === "emergency" ? 255 : resolved.playerId,
            });
        }
    }

    /**
     * Ask the host to start a meeting either for a reported body or for an emergency.
     * @param body Either the body to report or whether it was an emergency.
     * @see {PlayerControl.startMeeting} If the player is the host and this can happen immediately.
     * @example
	 *```typescript
     * // Report a dead body.
     * client.me.control.startMeeting(player);
     *
     * // Call an emergency meeting.
     * client.me.control.startMeeting("emergency");
     * ```
	 */
    reportDeadBody(body: PlayerDataResolvable | "emergency") {
        const resolved =
            body === "emergency" ? null : this.room.resolvePlayer(body);

        if (resolved || body === "emergency") {
            this.room.broadcast(
                [
                    {
                        tag: MessageTag.RPC,
                        netid: this.netid,
                        rpcid: RpcTag.ReportDeadBody,
                        bodyid: body === "emergency" ? 255 : resolved.playerId,
                    },
                ],
                true,
                this.room.host
            );
        }
    }
}
