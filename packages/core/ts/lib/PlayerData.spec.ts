import { SpawnID } from "@skeldjs/constant";
import assert from "assert";
import {
    CustomNetworkTransform,
    PlayerControl,
    PlayerPhysics,
} from "./component";
import { Hostable } from "./Hostable";

import { PlayerData } from "./PlayerData";

describe("PlayerData", () => {
    describe("PlayerData#ctr", () => {
        it("Should instantiate a player data object with a room and the client id of the player.", () => {
            const room = new Hostable();
            const player = new PlayerData(room, 1013);

            assert.strictEqual(player.room, room);
            assert.strictEqual(player.id, 1013);
        });
    });

    describe("PlayerData#control", () => {
        it("Should retrieve the player's player control component.", async () => {
            const room = new Hostable();
            const player = new PlayerData(room, 1013);
            room.objects.set(1013, player);
            const object = await room.spawnPrefab(SpawnID.Player, player);

            assert.strictEqual(object.components[0], player.control);
        });
    });

    describe("PlayerData#physics", () => {
        it("Should retrieve the player's player physics component.", async () => {
            const room = new Hostable();
            const player = new PlayerData(room, 1013);
            room.objects.set(1013, player);
            const object = await room.spawnPrefab(SpawnID.Player, player);

            assert.strictEqual(object.components[1], player.physics);
        });
    });

    describe("PlayerData#transform", () => {
        it("Should retrieve the player's custom network transform component.", async () => {
            const room = new Hostable();
            const player = new PlayerData(room, 1013);
            room.objects.set(1013, player);
            const object = await room.spawnPrefab(SpawnID.Player, player);

            assert.strictEqual(object.components[2], player.transform);
        });
    });

    describe("PlayerData#data", () => {
        it("Should retrieve the player's game data (name, colour, hat, etc.).", async () => {
            const room = new Hostable();
            const player = await room.handleJoin(1013);
            await room.spawnPrefab(SpawnID.GameData, -2);
            await room.spawnPrefab(SpawnID.Player, player);

            assert.ok(room.gamedata.players.get(player.playerId));
            assert.strictEqual(
                player.data,
                room.gamedata.players.get(player.playerId)
            );
        });
    });

    describe("PlayerData#playerId", () => {
        it("Should retrieve the player's player ID.", async () => {
            const room = new Hostable();
            const player = await room.handleJoin(1013);
            await room.spawnPrefab(SpawnID.Player, player);

            assert.strictEqual(player.playerId, 0);
        });
    });

    describe("PlayerData#spawned", () => {
        it("Should return true if all of the player's components have spawned.", async () => {
            const room = new Hostable();
            const player = await room.handleJoin(1013);

            room.spawnComponent(new PlayerControl(room, 1, 1013));
            assert.ok(!player.spawned);

            room.spawnComponent(new PlayerPhysics(room, 2, 1013));
            assert.ok(!player.spawned);

            room.spawnComponent(new CustomNetworkTransform(room, 3, 1013));
            assert.ok(player.spawned);
        });
    });

    describe("PlayerData#ishost", () => {
        it("Should return true if the player is the host's player data object.", async () => {
            const room = new Hostable();
            const player = await room.handleJoin(1013);

            assert.ok(!player.ishost);

            room.setHost(1013);

            assert.ok(player.ishost);
        });
    });

    describe("PlayerData#ready", () => {
        it("Should mark the player as readied up.", async () => {
            const room = new Hostable();
            const player = new PlayerData(room, 1013);

            await player.ready();

            assert.ok(player.isReady);
        });

        it("Should emit a player ready event.", async () => {
            const room = new Hostable();
            const player = new PlayerData(room, 1013);

            let did_receive = false;
            player.on("player.ready", () => {
                did_receive = true;
            });

            await player.ready();

            assert.ok(did_receive);
        });
    });
});
