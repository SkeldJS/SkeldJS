import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetTasksMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetTasks as const;
    messageTag = RpcMessageTag.SetTasks as const;

    playerId: number;
    taskids: number[];

    constructor(playerId: number, taskids: number[]) {
        super();

        this.playerId = playerId;
        this.taskids = taskids;
    }

    static Deserialize(reader: HazelReader) {
        const playerId = reader.uint8();
        const tasks = reader.list((r) => r.uint8());

        return new SetTasksMessage(playerId, tasks);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.playerId);
        writer.list(true, this.taskids, (t) => writer.uint8(t));
    }

    clone() {
        return new SetTasksMessage(this.playerId, [...this.taskids]);
    }
}
