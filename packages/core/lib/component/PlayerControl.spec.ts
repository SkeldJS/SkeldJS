import {
    DistanceID,
    LanguageID,
    MapID,
    MessageTag,
    RpcTag,
    SpawnID,
    TaskBarUpdate,
    TheSkeldTask,
} from "@skeldjs/constant";
import { HazelBuffer } from "@skeldjs/util";
import assert from "assert";
import { Hostable } from "../Hostable";

import { PlayerControl } from "./PlayerControl";

describe("PlayerControl", () => {
    describe("PlayerControl#Deserialize", () => {
        it("Should deserialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelBuffer.from("0105");
            control.Deserialize(reader, true);

            assert.ok(control.isNew);
            assert.strictEqual(control.playerId, 5);
        });

        it("Should deserialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelBuffer.from("0003");
            control.Deserialize(reader, true);

            assert.ok(!control.isNew);
            assert.strictEqual(control.playerId, 3);
        });

        it("Should deserialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelBuffer.from("03");
            control.Deserialize(reader, false);

            assert.strictEqual(control.playerId, 3);
        });

        it("Should deserialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013);

            const reader = HazelBuffer.from("07");
            control.Deserialize(reader, false);

            assert.strictEqual(control.playerId, 7);
        });
    });

    describe("PlayerControl#Serialize", () => {
        it("Should serialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: true,
                playerId: 5,
            });

            const writer = HazelBuffer.alloc(0);
            control.Serialize(writer, true);

            assert.strictEqual(writer.toString("hex"), "0105");
        });

        it("Should serialize a spawn packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: false,
                playerId: 6,
            });

            const writer = HazelBuffer.alloc(0);
            control.Serialize(writer, true);

            assert.strictEqual(writer.toString("hex"), "0006");
        });

        it("Should serialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: false,
                playerId: 1,
            });

            const writer = HazelBuffer.alloc(0);
            control.Serialize(writer, false);

            assert.strictEqual(writer.toString("hex"), "01");
        });

        it("Should serialize a data packet.", () => {
            const control = new PlayerControl(null, 1, 1013, {
                isNew: false,
                playerId: 10,
            });

            const writer = HazelBuffer.alloc(0);
            control.Serialize(writer, false);

            assert.strictEqual(writer.toString("hex"), "0a");
        });
    });

    describe("PlayerControl#HandleRpc", async () => {
        const room = new Hostable();
        await room.spawnPrefab(SpawnID.GameData, room);
        const player = await room.handleJoin(1013);
        await room.spawnPrefab(SpawnID.Player, player);

        room.gamedata.setTasks(player, [
            TheSkeldTask.ReactorStartReactor,
            TheSkeldTask.AdminSwipeCard,
            TheSkeldTask.NavigationChartCourse,
        ]);

        it("Should handle a CompleteTask Rpc packet.", () => {
            assert.ok(
                !room.gamedata.players.get(player.playerId).tasks[1].completed
            );

            player.control.HandleRpc({
                tag: MessageTag.RPC,
                rpcid: RpcTag.CompleteTask,
                netid: player.control.netid,
                taskIdx: 1,
            });

            assert.ok(
                room.gamedata.players.get(player.playerId).tasks[1].completed
            );
        });

        it("Should handle a sync settings Rpc packet.", () => {
            player.control.HandleRpc({
                tag: MessageTag.RPC,
                rpcid: RpcTag.SyncSettings,
                netid: player.control.netid,
                settings: {
                    version: 4,
                    players: 10,
                    language: LanguageID.Other,
                    map: MapID.TheSkeld,
                    playerSpeed: 2,
                    crewmateVision: 1,
                    impostorVision: 1.5,
                    killCooldown: 45,
                    commonTasks: 1,
                    longTasks: 1,
                    shortTasks: 2,
                    emergencies: 1,
                    impostors: 3,
                    killDistance: DistanceID.Medium,
                    discussionTime: 15,
                    votingTime: 60,
                    isDefaults: false,
                    emergencyCooldown: 0,
                    confirmEjects: false,
                    visualTasks: false,
                    anonymousVotes: false,
                    taskbarUpdates: TaskBarUpdate.Always,
                },
            });
        });
    });
});
