import { BaseDataMessage } from "@skeldjs/protocol";
import { HazelReader } from "@skeldjs/hazel";
import { SystemStatus } from "./SystemStatus";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export class VentilationSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType> {
    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        throw new Error("Method not implemented.");
    }

    handleData(data: BaseDataMessage): Promise<void> {
        throw new Error("Method not implemented.");
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        throw new Error("Method not implemented.");
    }
}