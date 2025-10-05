import { HazelBuffer, HazelReader, HazelWriter } from "@skeldjs/util";
import { SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { StatefulRoom } from "../StatefulRoom";
import { GameLogicComponent } from "../logic";
import { BaseRpcMessage } from "@skeldjs/protocol";

export type InnerGameManagerEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> & ExtractEventTypes<[]>;

export abstract class InnerGameManager<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, InnerGameManagerEvents<RoomType>> {
    logicComponents: GameLogicComponent<any, RoomType>[] = [];

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);

        this.initComponents();
    }

    get owner() {
        return super.owner as RoomType;
    }
    
    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }

    deserializeFromReader(reader: HazelReader, spawn = false): void {
        if (this.logicComponents === undefined || this.logicComponents.length === 0) this.initComponents();

        while (reader.left > 0) {
            const [tag, mreader] = reader.message();
            if (tag >= this.logicComponents.length) continue;

            this.logicComponents[tag].deserializeFromReader(mreader, spawn);
        }
    }

    serializeToWriter(writer: HazelWriter, spawn = false): boolean {
        let didWrite = false;
        for (let i = 0; i < this.logicComponents.length; i++) {
            const logicComponent = this.logicComponents[i];
            if (spawn || logicComponent.isDirty) {
                didWrite = true;
                writer.begin(i);
                logicComponent.serializeToWriter(writer, spawn);
                writer.end();
                logicComponent.isDirty = false;
            }
        }
        return didWrite;
    }

    abstract initComponents(): void;
    abstract onGameStart(): Promise<void>;

    // TODO: Implement (GameManager.cs)
}
