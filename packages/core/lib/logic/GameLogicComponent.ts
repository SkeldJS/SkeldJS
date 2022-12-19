import { EventData, EventEmitter } from "@skeldjs/events";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Hostable } from "../Hostable";
import { InnerGameManager } from "../objects";

export abstract class GameLogicComponent<Events extends EventData, RoomType extends Hostable = Hostable> extends EventEmitter<Events> {
    isDirty: boolean;

    constructor(public readonly manager: InnerGameManager<RoomType>) {
        super();

        this.isDirty = false;
    }

    FixedUpdate(deltaTime: number) {}
    async HandleRpc(rpc: BaseRpcMessage) {}
    Serialize(writer: HazelWriter, initialState: boolean) {}
    Deserialize(reader: HazelReader, initialState: boolean) {}

    async onGameStart() {}
    async onGameEnd() {}
    async onDestroy() {}

    async onPlayerDisconnect() {}
}
