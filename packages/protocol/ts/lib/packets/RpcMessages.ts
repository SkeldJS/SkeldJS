import {
    ColorID,
    HatID,
    MessageID,
    RpcID,
    SkinID
} from "@skeldjs/constant";

import {
    PlayerVoteState,
    PlayerGameData
} from "@skeldjs/types"

import {
    Vector2
} from "@skeldjs/util"

import { BaseGameDataMessage } from "./GameData";

import { GameOptions } from "../misc/GameOptions";

export interface BaseRpcMessage extends BaseGameDataMessage {
    tag: MessageID.RPC;
    rpcid: RpcID;
    netid: number;
}

export interface PlayAnimationRpc extends BaseRpcMessage {
    rpcid: RpcID.PlayAnimation;
    task: number;
}

export interface CompleteTaskRpc extends BaseRpcMessage {
    rpcid: RpcID.CompleteTask;
    taskIdx: number;
}

export interface SyncSettingsRpc extends BaseRpcMessage {
    rpcid: RpcID.SyncSettings;
    settings: GameOptions;
}

export interface SetInfectedRpc extends BaseRpcMessage {
    rpcid: RpcID.SetInfected;
    impostors: number[];
}

export interface ExiledRpc extends BaseRpcMessage {
    rpcid: RpcID.Exiled;
}

export interface CheckNameRpc extends BaseRpcMessage {
    rpcid: RpcID.CheckName;
    name: string;
}

export interface SetNameRpc extends BaseRpcMessage {
    rpcid: RpcID.SetName;
    name: string;
}

export interface CheckColorRpc extends BaseRpcMessage {
    rpcid: RpcID.CheckColor;
    color: ColorID;
}

export interface SetColorRpc extends BaseRpcMessage {
    rpcid: RpcID.SetColor;
    color: ColorID;
}

export interface SetHatRpc extends BaseRpcMessage {
    rpcid: RpcID.SetHat;
    hat: HatID;
}

export interface SetSkinRpc extends BaseRpcMessage {
    rpcid: RpcID.SetSkin;
    skin: SkinID;
}

export interface ReportDeadBodyRpc extends BaseRpcMessage {
    rpcid: RpcID.ReportDeadBody;
    bodyid: number;
}

export interface MurderPlayerRpc extends BaseRpcMessage {
    rpcid: RpcID.MurderPlayer;
    victimid: number;
}

export interface SendChatRpc extends BaseRpcMessage {
    rpcid: RpcID.SendChat;
    message: string;
}

export interface StartMeetingRpc extends BaseRpcMessage {
    rpcid: RpcID.StartMeeting;
    bodyid: number;
}

export interface SetScannerRpc extends BaseRpcMessage {
    rpcid: RpcID.SetScanner;
    scanning: boolean;
    count: number;
}

export interface SendChatNoteRpc extends BaseRpcMessage {
    rpcid: RpcID.SendChatNote;
    playerid: number;
    type: number;
}

export interface SetPetRpc extends BaseRpcMessage {
    rpcid: RpcID.SetPet;
    pet: number;
}

export interface SetStartCounterRpc extends BaseRpcMessage {
    rpcid: RpcID.SetStartCounter;
    seqId: number;
    time: number;
}

export interface EnterVentRpc extends BaseRpcMessage {
    rpcid: RpcID.EnterVent;
    ventid: number;
}

export interface ExitVentRpc extends BaseRpcMessage {
    rpcid: RpcID.ExitVent;
    ventid: number;
}

export interface SnapToRpc extends BaseRpcMessage {
    rpcid: RpcID.SnapTo;
    position: Vector2;
    seqId: number;
}

export interface CloseRpc extends BaseRpcMessage {
    rpcid: RpcID.Close;
}   

export interface VotingCompleteRpc extends BaseRpcMessage {
    rpcid: RpcID.VotingComplete;
    states: PlayerVoteState[];
    exiled: number;
    tie: boolean;
}

export interface CastVoteRpc extends BaseRpcMessage {
    rpcid: RpcID.CastVote;
    votingid: number;
    suspectid: number;
}

export interface ClearVoteRpc extends BaseRpcMessage {
    rpcid: RpcID.ClearVote;
}

export interface AddVoteRpc extends BaseRpcMessage {
    rpcid: RpcID.AddVote;
    votingid: number;
    suspectid: number;
}

export interface CloseDoorsOfTypeRpc extends BaseRpcMessage {
    rpcid: RpcID.CloseDoorsOfType;
    systemid: number;
}

export interface RepairSystemRpc extends BaseRpcMessage {
    rpcid: RpcID.RepairSystem;
    systemid: number;
    repairerid: number;
    value: number;
}

export interface SetTasksRpc extends BaseRpcMessage {
    rpcid: RpcID.SetTasks;
    playerid: number;
    taskids: number[];
}

export interface UpdateGameDataRpc extends BaseRpcMessage {
    rpcid: RpcID.UpdateGameData;
    players: PlayerGameData[];
}

export type RpcMessage = PlayAnimationRpc |
    CompleteTaskRpc |
    SyncSettingsRpc |
    SetInfectedRpc |
    ExiledRpc |
    CheckNameRpc |
    SetNameRpc |
    CheckColorRpc |
    SetColorRpc |
    SetHatRpc |
    SetSkinRpc |
    ReportDeadBodyRpc |
    MurderPlayerRpc |
    SendChatRpc |
    StartMeetingRpc |
    SetScannerRpc |
    SendChatNoteRpc |
    SetPetRpc |
    SetStartCounterRpc |
    EnterVentRpc |
    ExitVentRpc |
    SnapToRpc |
    CloseRpc |
    VotingCompleteRpc |
    CastVoteRpc |
    ClearVoteRpc |
    AddVoteRpc |
    CloseDoorsOfTypeRpc |
    RepairSystemRpc |
    SetTasksRpc |
    UpdateGameDataRpc;