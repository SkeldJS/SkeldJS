import {
    MessageID
} from "@skeldjs/constant"

import { HazelBuffer } from "@skeldjs/util";

import { BaseHazelMessage } from "./Packets"
import { RpcMessage } from "./RpcMessages";

export interface BaseGameDataMessage extends BaseHazelMessage {
    tag: MessageID;
}

export interface DataMessage extends BaseGameDataMessage {
    tag: MessageID.Data;
    netid: number;
    data: HazelBuffer;
}

export interface ComponentData {
    netid: number;
    data: HazelBuffer;
}

export interface SpawnMessage extends BaseGameDataMessage {
    tag: MessageID.Spawn;
    type: number;
    ownerid: number;
    flags: number;
    components: ComponentData[];
}

export interface DespawnMessage extends BaseGameDataMessage {
    tag: MessageID.Despawn;
    netid: number;
}

export interface SceneChangeMessage extends BaseGameDataMessage {
    tag: MessageID.SceneChange;
    clientid: number;
    scene: string;
}

export interface ReadyMessage extends BaseGameDataMessage {
    tag: MessageID.Ready;
    clientid: number;
}

export interface ChangeSettings extends BaseGameDataMessage {
    tag: MessageID.ChangeSettings;
}

export type GameDataMessage = DataMessage |
    RpcMessage |
    SpawnMessage |
    DespawnMessage |
    SceneChangeMessage |
    ReadyMessage |
    ChangeSettings;