import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Color, Hat, Pet, PlayerDataFlags, Skin } from "@skeldjs/constant";
import { GameData } from "../component";

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

export class PlayerGameData {
    constructor(
        public readonly gamedata: GameData,
        public playerId: number,
        public name = "",
        public color = -1,
        public hat = Hat.None,
        public pet = Pet.None,
        public skin = Skin.None,
        public flags = 0,
        public taskIds: number[] = [],
        public taskStates: TaskState[] = []
    ) {}

    get player() {
        return this.gamedata.room.getPlayerByPlayerId(this.playerId);
    }

    get isDisconnected() {
        return (this.flags & PlayerDataFlags.IsDisconnected)
            === PlayerDataFlags.IsDisconnected;
    }

    get isImpostor() {
        return (this.flags & PlayerDataFlags.IsImpostor)
            === PlayerDataFlags.IsImpostor;
    }

    get isDead() {
        return (this.flags & PlayerDataFlags.IsDead)
            === PlayerDataFlags.IsDead;
    }

    static createDefault(gamedata: GameData, playerId: number) {
        return new PlayerGameData(gamedata, playerId, "", Color.Red, Hat.None, Pet.None, Skin.None, 0, [], []);
    }

    static Deserialize(reader: HazelReader, gamedata: GameData, playerId: number) {
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

    clone(playerId: number) {
        return new PlayerGameData(
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

    setDisconnected(isDisconnected: boolean) {
        if (isDisconnected) {
            this.setFlags(this.flags | PlayerDataFlags.IsDisconnected);
        } else {
            this.setFlags(this.flags & ~PlayerDataFlags.IsDisconnected);
        }
    }

    setImpostor(isImpostor: boolean) {
        if (isImpostor) {
            this.setFlags(this.flags | PlayerDataFlags.IsImpostor);
        } else {
            this.setFlags(this.flags & ~PlayerDataFlags.IsImpostor);
        }
    }

    setDead(isDead: boolean) {
        if (isDead) {
            this.setFlags(this.flags | PlayerDataFlags.IsDead);
        } else {
            this.setFlags(this.flags & ~PlayerDataFlags.IsDead);
        }
    }

    setName(name: string) {
        this.name = name;
        this.gamedata.update(this);
    }

    setColor(color: Color) {
        this.color = color;
        this.gamedata.update(this);
    }

    setHat(hat: Hat) {
        this.hat = hat;
        this.gamedata.update(this);
    }

    setPet(pet: Pet) {
        this.pet = pet;
        this.gamedata.update(this);
    }

    setSkin(skin: Skin) {
        this.skin = skin;
        this.gamedata.update(this);
    }

    setFlags(flags: number) {
        this.flags = flags;
        this.gamedata.update(this);
    }

    setTaskIds(taskIds: number[]) {
        this.taskIds = taskIds;
        this.gamedata.update(this);
    }

    setTaskStates(taskStates: TaskState[]) {
        this.taskStates = taskStates;
        this.gamedata.update(this);
    }

    completeTask(state: TaskState) {
        state.completed = true;
        this.gamedata.update(this);
    }
}
