import {
    ColorID,
    HatID,
    MessageTag,
    RpcTag,
    SkinID,
    PlayerGameData,
} from "@skeldjs/constant";

import { Vector2 } from "@skeldjs/util";

import { BaseGameDataMessage } from "./GameData";

import { GameOptions } from "../misc/GameOptions";

export interface BaseRpcMessage extends BaseGameDataMessage {
    tag: MessageTag.RPC;
    rpcid: RpcTag;
    netid: number;
}

export interface PlayAnimationRpc extends BaseRpcMessage {
    rpcid: RpcTag.PlayAnimation;
    task: number;
}

export interface CompleteTaskRpc extends BaseRpcMessage {
    rpcid: RpcTag.CompleteTask;
    taskIdx: number;
}

export interface SyncSettingsRpc extends BaseRpcMessage {
    rpcid: RpcTag.SyncSettings;
    settings: GameOptions;
}

export interface SetInfectedRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetInfected;
    impostors: number[];
}

export interface ExiledRpc extends BaseRpcMessage {
    rpcid: RpcTag.Exiled;
}

export interface CheckNameRpc extends BaseRpcMessage {
    rpcid: RpcTag.CheckName;
    name: string;
}

export interface SetNameRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetName;
    name: string;
}

export interface CheckColorRpc extends BaseRpcMessage {
    rpcid: RpcTag.CheckColor;
    color: ColorID;
}

export interface SetColorRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetColor;
    color: ColorID;
}

export interface SetHatRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetHat;
    hat: HatID;
}

export interface SetSkinRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetSkin;
    skin: SkinID;
}

export interface ReportDeadBodyRpc extends BaseRpcMessage {
    rpcid: RpcTag.ReportDeadBody;
    bodyid: number;
}

export interface MurderPlayerRpc extends BaseRpcMessage {
    rpcid: RpcTag.MurderPlayer;
    victimid: number;
}

export interface SendChatRpc extends BaseRpcMessage {
    rpcid: RpcTag.SendChat;
    message: string;
}

export interface StartMeetingRpc extends BaseRpcMessage {
    rpcid: RpcTag.StartMeeting;
    bodyid: number;
}

export interface SetScannerRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetScanner;
    scanning: boolean;
    count: number;
}

export interface SendChatNoteRpc extends BaseRpcMessage {
    rpcid: RpcTag.SendChatNote;
    playerid: number;
    type: number;
}

export interface SetPetRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetPet;
    pet: number;
}

export interface SetStartCounterRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetStartCounter;
    seqId: number;
    time: number;
}

export interface EnterVentRpc extends BaseRpcMessage {
    rpcid: RpcTag.EnterVent;
    ventid: number;
}

export interface ExitVentRpc extends BaseRpcMessage {
    rpcid: RpcTag.ExitVent;
    ventid: number;
}

export interface SnapToRpc extends BaseRpcMessage {
    rpcid: RpcTag.SnapTo;
    position: Vector2;
    seqId: number;
}

export interface CloseRpc extends BaseRpcMessage {
    rpcid: RpcTag.Close;
}

export interface VotingCompleteRpc extends BaseRpcMessage {
    rpcid: RpcTag.VotingComplete;
    states: number[];
    exiled: number;
    tie: boolean;
}

export interface CastVoteRpc extends BaseRpcMessage {
    rpcid: RpcTag.CastVote;
    votingid: number;
    suspectid: number;
}

export interface ClearVoteRpc extends BaseRpcMessage {
    rpcid: RpcTag.ClearVote;
}

export interface AddVoteRpc extends BaseRpcMessage {
    rpcid: RpcTag.AddVote;
    votingid: number;
    targetid: number;
}

export interface CloseDoorsOfTypeRpc extends BaseRpcMessage {
    rpcid: RpcTag.CloseDoorsOfType;
    systemid: number;
}

export interface RepairSystemRpc extends BaseRpcMessage {
    rpcid: RpcTag.RepairSystem;
    systemid: number;
    repairerid: number;
    value: number;
}

export interface SetTasksRpc extends BaseRpcMessage {
    rpcid: RpcTag.SetTasks;
    playerid: number;
    taskids: number[];
}

export interface UpdateGameDataRpc extends BaseRpcMessage {
    rpcid: RpcTag.UpdateGameData;
    players: PlayerGameData[];
}

export type RpcMessage =
    | PlayAnimationRpc
    | CompleteTaskRpc
    | SyncSettingsRpc
    | SetInfectedRpc
    | ExiledRpc
    | CheckNameRpc
    | SetNameRpc
    | CheckColorRpc
    | SetColorRpc
    | SetHatRpc
    | SetSkinRpc
    | ReportDeadBodyRpc
    | MurderPlayerRpc
    | SendChatRpc
    | StartMeetingRpc
    | SetScannerRpc
    | SendChatNoteRpc
    | SetPetRpc
    | SetStartCounterRpc
    | EnterVentRpc
    | ExitVentRpc
    | SnapToRpc
    | CloseRpc
    | VotingCompleteRpc
    | CastVoteRpc
    | ClearVoteRpc
    | AddVoteRpc
    | CloseDoorsOfTypeRpc
    | RepairSystemRpc
    | SetTasksRpc
    | UpdateGameDataRpc;
