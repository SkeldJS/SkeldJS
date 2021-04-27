import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Color, Hat, Pet, PlayerDataFlags, Skin } from "@skeldjs/constant";

export class TaskState {
    constructor(public taskidx: number, public completed: boolean) {}

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
        public playerId: number,
        public name = "",
        public color = Color.Red,
        public hat = Hat.None,
        public pet = Pet.None,
        public skin = Skin.None,
        public flags = 0,
        public tasks: TaskState[] = []
    ) {}

    static Deserialize(reader: HazelReader, playerId: number) {
        const player = new PlayerGameData(playerId);
        player.Deserialize(reader);
        return player;
    }

    get disconnected() {
        return (this.flags & PlayerDataFlags.IsDisconnected) > 0;
    }

    set disconnected(value: boolean) {
        if (value) {
            this.flags |= PlayerDataFlags.IsDisconnected;
        } else {
            this.flags &= ~PlayerDataFlags.IsDisconnected;
        }
    }

    get impostor() {
        return (this.flags & PlayerDataFlags.IsImpostor) > 0;
    }

    set impostor(value: boolean) {
        if (value) {
            this.flags |= PlayerDataFlags.IsImpostor;
        } else {
            this.flags &= ~PlayerDataFlags.IsImpostor;
        }
    }

    get dead() {
        return (this.flags & PlayerDataFlags.IsDead) > 0;
    }

    set dead(value: boolean) {
        if (value) {
            this.flags |= PlayerDataFlags.IsDead;
        } else {
            this.flags &= ~PlayerDataFlags.IsDead;
        }
    }

    Deserialize(reader: HazelReader) {
        this.name = reader.string();
        this.color = reader.packed();
        this.hat = reader.upacked();
        this.pet = reader.upacked();
        this.skin = reader.upacked();
        this.flags = reader.byte();

        this.tasks = [];
        const num_tasks = reader.uint8();
        this.tasks = reader.lread(num_tasks, TaskState);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.name);
        writer.packed(this.color);
        writer.upacked(this.hat);
        writer.upacked(this.pet);
        writer.upacked(this.skin);
        writer.byte(this.flags);

        writer.uint8(this.tasks.length);
        writer.lwrite(false, this.tasks);
    }
}
