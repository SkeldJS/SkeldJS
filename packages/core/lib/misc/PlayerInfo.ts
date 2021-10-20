import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Color, Hat, Pet, PlayerDataFlags, Skin } from "@skeldjs/constant";
import { GameData } from "../objects";
import { Hostable } from "../Hostable";

export class TaskState {
    constructor(
        public taskidx: number,
        public completed: boolean
    ) {}

    static Deserialize(reader: HazelReader) {
        const task = new TaskState(0, false);
        task.Deserialize(reader);
        return task;
    }

    Deserialize(reader: HazelReader) {
        this.taskidx = reader.upacked();
        this.completed = reader.bool();
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.taskidx);
        writer.bool(this.completed);
    }
}

/**
 * Represents a player's information, name, color, hat, etc.
 */
export class PlayerInfo<RoomType extends Hostable = Hostable> {
    constructor(
        public readonly gamedata: GameData<RoomType>,
        public playerId: number,
        public name = "",
        public color = 0,
        public hat = Hat.None,
        public pet = Pet.None,
        public skin = Skin.None,
        public flags = 0,
        public taskIds: number[] = [],
        public taskStates: TaskState[] = []
    ) {}

    /**
     * The player that this info is for.
     */
    get player() {
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
        return new PlayerInfo(gamedata, playerId, "", Color.Red, Hat.None, Pet.None, Skin.None, 0, [], []);
    }

    static Deserialize<RoomType extends Hostable = Hostable>(reader: HazelReader, gamedata: GameData<RoomType>, playerId: number) {
        const player = this.createDefault(gamedata, playerId);
        player.Deserialize(reader);
        return player;
    }

    Deserialize(reader: HazelReader) {
        this.name = reader.string();
        this.color = reader.packed();
        this.hat = reader.upacked();
        this.pet = reader.upacked();
        this.skin = reader.upacked();
        this.flags = reader.byte();

        this.taskStates = [];
        const num_tasks = reader.uint8();
        this.taskStates = reader.lread(num_tasks, TaskState);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.name || "");
        writer.packed(this.color || 0);
        writer.upacked(this.hat || 0);
        writer.upacked(this.pet || 0);
        writer.upacked(this.skin || 0);
        writer.byte(this.flags || 0);

        writer.uint8(this.taskStates?.length || 0);
        writer.lwrite(false, this.taskStates || []);
    }

    /**
     * Clone the player info for another player.
     */
    clone(playerId: number) {
        return new PlayerInfo(
            this.gamedata,
            playerId,
            this.name,
            this.color,
            this.hat,
            this.pet,
            this.skin,
            this.flags,
            [...this.taskIds],
            [...this.taskStates.map(state => new TaskState(state.taskidx, state.completed))]
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
     * Set the name of this player.
     */
    setName(name: string) {
        this.name = name;
        this.gamedata.update(this);
    }

    /**
     * Set the color of this player.
     */
    setColor(color: Color) {
        this.color = color;
        this.gamedata.update(this);
    }

    /**
     * Set the hat of this player.
     */
    setHat(hat: Hat) {
        this.hat = hat;
        this.gamedata.update(this);
    }

    /**
     * Set the pet of this player.
     */
    setPet(pet: Pet) {
        this.pet = pet;
        this.gamedata.update(this);
    }

    /**
     * Set the skin of this player.
     */
    setSkin(skin: Skin) {
        this.skin = skin;
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
