import { HazelReader, HazelWriter } from "@skeldjs/util";
import { AllGameOptions, GameOptions, RpcMessage } from "@skeldjs/protocol";

import {
    ChatNoteType,
    TaskState,
    SystemType,
    Color,
    Hat,
    Skin,
    Pet,
    SpawnType,
    RpcMessageTag,
} from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { PlayerDataResolvable, Hostable } from "../Hostable";
import {
    MovingPlatformSide,
    MovingPlatformSystem,
} from "../system/MovingPlatformSystem";

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
        color: Color;
    };
    /**
     * Emitted when a player sets their hat.
     */
    "player.sethat": {
        /**
         * The hat of the player.
         */
        hat: Hat;
    };
    /**
     * Emitted when a player sets their skin.
     */
    "player.setskin": {
        /**
         * The skin of the player.
         */
        skin: Skin;
    };
    /**
     * Emitted when a player sets their pet.
     */
    "player.setpet": {
        /**
         * The pet of the player.
         */
        pet: Pet;
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
export class PlayerControl extends Networkable<
    PlayerControlData,
    PlayerControlEvents
> {
    static type = SpawnType.Player as const;
    type = SpawnType.Player as const;

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
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | PlayerControlData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            this.isNew = reader.bool();
        }

        this.playerId = reader.uint8();
    }

    Serialize(writer: HazelWriter, spawn: boolean = false) {
        if (spawn) {
            writer.bool(this.isNew);
            this.isNew = false;
        }

        writer.uint8(this.playerId);
        return true;
    }

    HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.CompleteTask:
                const taskIdx = reader.upacked();
                this._completeTask(taskIdx);
                break;
            case RpcMessageTag.SyncSettings:
                const settings = reader.read(GameOptions);
                this._syncSettings(settings);
                break;
            case RpcMessageTag.SetInfected:
                const impostors = reader.list((r) => r.uint8());
                this._setInfected(impostors);
                break;
            case RpcMessageTag.CheckName:
                const name = reader.string();
                if (this.room.amhost) {
                    if (!this.room.gamedata) {
                        return;
                    }

                    const players = [...this.room.gamedata.players.values()];
                    if (
                        players.some(
                            (player) =>
                                player.playerId !== this.playerId &&
                                name.toLowerCase() === name.toLowerCase()
                        )
                    ) {
                        for (let i = 1; i < 100; i++) {
                            const new_name = name + " " + i;

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

                    this.setName(name);
                }
                break;
            case RpcMessageTag.CheckColor:
                let color = reader.uint8();
                if (this.room.amhost) {
                    if (!this.room.gamedata) {
                        return;
                    }

                    const players = [...this.room.gamedata.players.values()];
                    while (
                        players.some(
                            (player) =>
                                player.playerId !== this.playerId &&
                                player.color === color
                        )
                    ) {
                        color++;
                        if (color > 11) {
                            color = 0;
                        }
                    }

                    this.setColor(color);
                }
                break;
            case RpcMessageTag.SetName: {
                const name = reader.string();
                this._setName(name);
                break;
            }
            case RpcMessageTag.SetColor: {
                const color = reader.uint8();
                this._setColor(color);
                break;
            }
            case RpcMessageTag.SetHat:
                const hat = reader.upacked();
                this._setHat(hat);
                break;
            case RpcMessageTag.SetSkin:
                const skin = reader.upacked();
                this._setSkin(skin);
                break;
            case RpcMessageTag.MurderPlayer:
                const victimid = reader.upacked();
                this._murderPlayer(victimid);
                break;
            case RpcMessageTag.SendChat:
                const message = reader.string();
                this._chat(message);
                break;
            case RpcMessageTag.StartMeeting:
                const bodyid = reader.uint8();
                this._startMeeting(bodyid);
                break;
            case RpcMessageTag.SetPet:
                const pet = reader.upacked();
                this._setPet(pet);
                break;
            case RpcMessageTag.SetStartCounter:
                /*TODO: Implement sequence IDs for joining/set start counter
                const seq = */ reader.upacked();
                const time = reader.uint8();
                this._setStartCounter(time);
                break;
            case RpcMessageTag.UsePlatform:
                this._usePlatform();
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
        const writer = HazelWriter.alloc(name.length + 1);
        writer.string(name);

        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.CheckName,
                    writer.buffer
                ),
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
     *   player.control.checkColour(Color.Blue);
     * });
     * ```
     */
    async checkColor(color: Color) {
        const writer = HazelWriter.alloc(1);
        writer.uint8(color);

        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.CheckColor,
                    writer.buffer
                ),
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

        const writer = HazelWriter.alloc(1);
        writer.upacked(taskIdx);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.CompleteTask,
                writer.buffer
            )
        );
    }

    private _murderPlayer(netid: number) {
        const resolved = this.room.getPlayerByNetId(netid);

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
            const writer = HazelWriter.alloc(1);
            writer.upacked(res_victim.control.netid);

            this.room.stream.push(
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.MurderPlayer,
                    writer.buffer
                )
            );
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
            const writer = HazelWriter.alloc(name.length + 1);
            writer.string(name);

            this.room.stream.push(
                new RpcMessage(this.netid, RpcMessageTag.SetName, writer.buffer)
            );
        }
    }

    private _setColor(color: Color) {
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
     *   player.control.setColor(Color.Blue);
     * });
     * ```
     */
    setColor(color: Color) {
        this._setColor(color);

        if (this.room.amhost) {
            const writer = HazelWriter.alloc(1);
            writer.uint8(color);

            this.room.stream.push(
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.SetColor,
                    writer.buffer
                )
            );
        }
    }

    private _setHat(hat: Hat) {
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
     * player.control.setHat(Hat.Fez);
     * ```
     */
    setHat(hat: Hat) {
        this._setHat(hat);

        const writer = HazelWriter.alloc(1);
        writer.upacked(hat);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.SetHat, writer.buffer)
        );
    }

    private _setSkin(skin: Skin) {
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
     * player.control.setSkin(Skin.Miner);
     * ```
     */
    setSkin(skin: Skin) {
        this._setSkin(skin);

        const writer = HazelWriter.alloc(1);
        writer.upacked(skin);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.SetSkin, writer.buffer)
        );
    }

    private _setPet(pet: Pet) {
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
     * player.control.setPet(Pet.Robot);
     * ```
     */
    setPet(pet: Pet) {
        this._setPet(pet);

        const writer = HazelWriter.alloc(1);
        writer.upacked(pet);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.SetPet, writer.buffer)
        );
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

        const writer = HazelWriter.alloc(message.length + 1);
        writer.string(message);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.SendChat, writer.buffer)
        );
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
        const writer = HazelWriter.alloc(2);
        writer.uint8(this.playerId);
        writer.uint8(type);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SendChatNote,
                writer.buffer
            )
        );
    }

    private _syncSettings(settings: Partial<AllGameOptions>) {
        this.room.settings.patch(settings);

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
    syncSettings(
        update_settings: Partial<AllGameOptions> | GameOptions = this.room
            .settings
    ) {
        this._syncSettings(update_settings);

        if (!(update_settings instanceof GameOptions)) {
            return this.room.settings;
        }

        const writer = HazelWriter.alloc(40);
        writer.write(update_settings);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SyncSettings,
                writer.buffer
            )
        );
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

        const writer = HazelWriter.alloc(2);
        writer.upacked(this.lastStartCounter);
        writer.uint8(counter);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetStartCounter,
                writer.buffer
            )
        );
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

        const writer = HazelWriter.alloc(resolved.length);
        writer.list(true, resolved, (player) => writer.uint8(player.playerId));

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.SetInfected, writer.buffer)
        );
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
     * ```typescript
     * // Start an emergency meeting.
     * if (client.amhost) {
     *   client.me.control.startMeeting("emergency");
     * } else {
     *   client.me.control.reportDeadBody("emergency");
     * }
     * ```
     * ```typescript
     * // Start an meeting reporting another player.
     * if (client.amhost) {
     *   client.me.control.startMeeting(player);
     * } else {
     *   client.me.control.reportDeadBody(player);
     * }
     * ```
     */
    startMeeting(body: PlayerDataResolvable | "emergency") {
        const resolved =
            body === "emergency" ? null : this.room.resolvePlayer(body);

        if (resolved || body === "emergency") {
            const writer = HazelWriter.alloc(1);
            writer.uint8(body === "emergency" ? 255 : resolved.playerId);

            this.room.stream.push(
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.StartMeeting,
                    writer.buffer
                )
            );
        }
    }

    /**
     * Ask the host to start a meeting either for a reported body or for an emergency.
     * @param body Either the body to report or whether it was an emergency.
     * @see {PlayerControl.startMeeting} If the player is the host and this can happen immediately.
     * @example
     * ```typescript
     * // Start an emergency meeting.
     * if (client.amhost) {
     *   client.me.control.startMeeting("emergency");
     * } else {
     *   client.me.control.reportDeadBody("emergency");
     * }
     * ```
     * ```typescript
     * // Start an meeting reporting another player.
     * if (client.amhost) {
     *   client.me.control.startMeeting(player);
     * } else {
     *   client.me.control.reportDeadBody(player);
     * }
     * ```
     */
    reportDeadBody(body: PlayerDataResolvable | "emergency") {
        const resolved =
            body === "emergency" ? null : this.room.resolvePlayer(body);

        if (resolved || body === "emergency") {
            const writer = HazelWriter.alloc(1);
            writer.uint8(body === "emergency" ? 255 : resolved.playerId);

            this.room.broadcast(
                [
                    new RpcMessage(
                        this.netid,
                        RpcMessageTag.ReportDeadBody,
                        writer.buffer
                    ),
                ],
                true,
                this.room.host
            );
        }
    }

    private _usePlatform() {
        const airship = this.room.shipstatus;

        if (airship.type === SpawnType.Airship) {
            const movingPlatform = airship.systems[
                SystemType.GapRoom
            ] as MovingPlatformSystem;

            if (movingPlatform) {
                movingPlatform.setTarget(
                    this.owner,
                    movingPlatform.side === MovingPlatformSide.Left
                        ? MovingPlatformSide.Right
                        : MovingPlatformSide.Left
                );
            }
        }
    }

    /**
     * Use the moving platform on the map. Currently only available for Airship.
     */
    usePlatform() {
        this._usePlatform();
    }
}
