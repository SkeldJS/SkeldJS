import { SpawnType } from "@skeldjs/constant";

import { Code2Int } from "@skeldjs/util";

import { DespawnMessage, SceneChangeMessage } from "@skeldjs/protocol";

import assert from "assert";

import { MeetingHud } from "./objects";
import { Hostable } from "./Hostable";

export class TestHost extends Hostable {
    get amhost() {
        return true;
    }
}

describe("Hostable", () => {
    describe("Hostable#ctr", () => {
        it("Should instantiate an empty room with a fixed update cycle.", () => {
            const room = new Hostable;

            assert.strictEqual(room.hostid, -1);

            assert.strictEqual(room.objects.size, 1);
            assert.strictEqual(room.objects.get(-2), room);

            assert.strictEqual(room.players.size, 0);
            assert.strictEqual(room.netobjects.size, 0);

            assert.deepStrictEqual(room.stream, []);
            assert.strictEqual(room.room, room);
        });
    });

    describe("Hostable#getNextNetId()", () => {
        it("Should increment the global netid counter every time it is read.", () => {
            const room = new Hostable;

            assert.strictEqual(room.getNextNetId(), 1);
            assert.strictEqual(room.getNextNetId(), 2);
            assert.strictEqual(room.getNextNetId(), 3);
            assert.strictEqual(room.getNextNetId(), 4);
        });
    });

    describe("Hostable#me", () => {
        it("Should be null as there is no client.", () => {
            const room = new Hostable;

            assert.strictEqual(room.me, undefined);
        });
    });

    describe("Hostable#host", () => {
        it("Should get the host of the room.", async () => {
            const room = new Hostable;

            const player = await room.handleJoin(1013);
            await room.setHost(1013);

            assert.strictEqual(room.hostid, 1013);
            assert.strictEqual(room.host, player);
        });
    });

    describe("Hostable#destoyed", () => {
        it("Should be true if the room has been destroyed.", () => {
            const room = new Hostable;

            room.destroy();

            assert.ok(room.destroyed);
        });
    });

    describe("Hostable#amhost", () => {
        it("Should be false as there is no client.", () => {
            const room = new Hostable;

            assert.ok(!room.amhost);
        });
    });

    describe("Hostable#shipstatus", () => {
        it("Should retrieve any ShipStatus object in the room.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.ShipStatus, -2);
            const ship = object.components[0];

            assert.strictEqual(room.shipstatus, ship);
        });
    });

    describe("Hostable#meetinghud", () => {
        it("Should retrieve the current meeting hud object in the room.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.MeetingHud, -2);
            const meetinghud = object.components[0];

            assert.strictEqual(room.meetinghud, meetinghud);
        });
    });

    describe("Hostable#lobbybehaviour", () => {
        it("Should retrieve the current lobby behaviour object in the room.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.LobbyBehaviour, -2);
            const lobbybehaviour = object.components[0];

            assert.strictEqual(room.lobbybehaviour, lobbybehaviour);
        });
    });

    describe("Hostable#gamedata", () => {
        it("Should retrieve the current gamedata object in the room.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.GameData, -2);
            const gamedata = object.components[0];

            assert.strictEqual(room.gamedata, gamedata);
        });
    });

    describe("Hostable#votebansystem", () => {
        it("Should retrieve the current vote ban system object in the room.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.GameData, -2);
            const votebansystem = object.components[1];

            assert.strictEqual(room.votebansystem, votebansystem);
        });
    });

    describe("Hostable#FixedUpdate", () => {
        it("Should flush the message stream.", async () => {
            const room = new Hostable;

            room.stream.push(
                new DespawnMessage(5),
                new SceneChangeMessage(1013, "OnlineGame")
            );

            assert.strictEqual(room.stream.length, 2);

            await room.FixedUpdate();

            assert.strictEqual(room.stream.length, 0);
        });
    });

    describe("Hostable#resolvePlayer", async () => {
        const room = new Hostable;

        const player = await room.handleJoin(1013);
        room.spawnPrefab(SpawnType.Player, player);

        it("Should resolve a client ID to a player data object.", () => {
            assert.strictEqual(room.resolvePlayer(1013), player);
        });

        it("Should resolve a player data object to a player data object.", () => {
            assert.strictEqual(room.resolvePlayer(player), player);
        });

        it("Should resolve a player control component to a player data object.", async () => {
            assert.strictEqual(room.resolvePlayer(player.control), player);
        });

        it("Should resolve a player physics component to a player data object.", () => {
            assert.strictEqual(room.resolvePlayer(player.physics), player);
        });

        it("Should resolve a custom network transform component to a player data object.", async () => {
            assert.strictEqual(room.resolvePlayer(player.transform), player);
        });
    });

    describe("Hostable#resolvePlayerId", async () => {
        const room = new Hostable;

        const player = await room.handleJoin(1013);
        room.spawnPrefab(SpawnType.GameData, -2);
        room.spawnPrefab(SpawnType.Player, player);

        it("Should resolve a player ID to a player ID.", () => {
            assert.strictEqual(
                room.resolvePlayerId(player.playerId),
                player.playerId
            );
        });

        it("Should resolve a player data object to a player ID.", () => {
            assert.strictEqual(room.resolvePlayerId(player), player.playerId);
        });

        it("Should resolve a player control component to a player ID.", () => {
            assert.strictEqual(
                room.resolvePlayerId(player.control),
                player.playerId
            );
        });

        it("Should resolve player game data to a player ID.", () => {
            const playerData = room.gamedata.players.get(player.playerId);
            assert.strictEqual(
                room.resolvePlayerId(playerData),
                player.playerId
            );
        });
    });

    describe("Hostable#resolvePlayerClientID", async () => {
        const room = new Hostable;

        const player = await room.handleJoin(1013);
        room.spawnPrefab(SpawnType.Player, player);

        it("Should resolve a client ID to a client ID.", () => {
            assert.strictEqual(room.resolvePlayerClientID(1013), 1013);
        });

        it("Should resolve a player data object to a client ID.", () => {
            assert.strictEqual(room.resolvePlayerClientID(player), 1013);
        });

        it("Should resolve a player control component to a client ID.", () => {
            assert.strictEqual(
                room.resolvePlayerClientID(player.control),
                1013
            );
        });

        it("Should resolve a player physics component to a client ID.", () => {
            assert.strictEqual(
                room.resolvePlayerClientID(player.physics),
                1013
            );
        });

        it("Should resolve a custom network transform component to a client ID.", () => {
            assert.strictEqual(
                room.resolvePlayerClientID(player.transform),
                1013
            );
        });

        it("Should resolve an invalid player reference to null.", () => {
            assert.strictEqual(room.resolvePlayerClientID(undefined), undefined);
        });
    });

    describe("Hostable#setCode", () => {
        it("Should change the access code of the room.", () => {
            const room = new Hostable;

            room.setCode("ABCDEF");
            assert.strictEqual(room.code, Code2Int("ABCDEF"));

            room.setCode("ROBSCB");
            assert.strictEqual(room.code, Code2Int("ROBSCB"));

            room.setCode("CHRIST");
            assert.strictEqual(room.code, Code2Int("CHRIST"));

            room.setCode("BETA");
            assert.strictEqual(room.code, Code2Int("BETA"));

            room.setCode("MALE");
            assert.strictEqual(room.code, Code2Int("MALE"));
        });
    });

    describe("Hostable#setPrivacy", () => {
        it("Should change the privacy of the room.", () => {
            const room = new Hostable;

            room.setPrivacy("public");
            assert.strictEqual(room.privacy, "public");

            room.setPrivacy("private");
            assert.strictEqual(room.privacy, "private");
        });
    });

    describe("Hostable#setHost", () => {
        it("Should change the current host of the room.", async () => {
            const room = new Hostable;

            const player = await room.handleJoin(1013);
            room.setHost(1013);

            assert.strictEqual(room.hostid, 1013);
            assert.strictEqual(room.host, player);
        });

        it("Should emit a set host event if the host is different.", async () => {
            const room = new Hostable;

            const player = await room.handleJoin(1013);

            let did_call = false;
            room.on("player.sethost", (ev) => {
                if (ev.player.id === 1013) {
                    did_call = true;
                }
            });

            await room.setHost(1013);

            assert.strictEqual(room.hostid, 1013);
            assert.strictEqual(room.host, player);
            assert.ok(did_call);
        });

        it("Should spawn necessary objects if they are not already spawned.", async () => {
            const room = new TestHost;
            await room.handleJoin(1013);

            assert.ok(!room.lobbybehaviour);
            assert.ok(!room.gamedata);

            room.setHost(1013);

            assert.ok(room.lobbybehaviour);
            assert.ok(room.gamedata);
        });
    });

    describe("Hostable#handleJoin", () => {
        it("Should add a player to the game.", async () => {
            const room = new Hostable;
            await room.handleJoin(1013);
            await room.handleJoin(1023);

            assert.deepStrictEqual([...room.players.keys()], [1013, 1023]);

            assert.ok(room.objects.has(1013));
            assert.ok(room.objects.has(1023));
        });

        it("Should emit a player join event.", async () => {
            const room = new Hostable;

            let did_call = false;
            room.on("player.join", (ev) => {
                if (ev.player.id === 1013) {
                    did_call = true;
                }
            });

            await room.handleJoin(1013);

            assert.ok(did_call);
        });
    });

    describe("Hostable#handleLeave", () => {
        it("Should remove a player from the game.", async () => {
            const room = new Hostable;
            await room.handleJoin(1013);
            await room.handleJoin(1023);

            await room.handleLeave(1013);

            assert.deepStrictEqual([...room.players.keys()], [1023]);
            assert.ok(!room.objects.has(1013));
        });

        it("Should emit a player leave event.", async () => {
            const room = new Hostable;

            const player = await room.handleJoin(1013);

            let did_call = false;
            room.on("player.leave", (ev) => {
                if (ev.player.id === 1013) {
                    did_call = true;
                }
            });

            room.handleLeave(player);

            assert.ok(did_call);
        });

        it("Should remove the player from gamedata records.", async () => {
            const room = new Hostable;
            const player = await room.handleJoin(1013);
            room.spawnPrefab(SpawnType.GameData, room);
            room.spawnPrefab(SpawnType.Player, player);

            assert.ok(room.gamedata.players.get(player.playerId));

            room.handleLeave(player);

            assert.ok(!room.gamedata.players.get(player.playerId));
        });

        it("Should remove the player from votebansystem records.", async () => {
            const room = new Hostable;
            const player = await room.handleJoin(1013);
            await room.handleJoin(1023);
            room.spawnPrefab(SpawnType.GameData, room);
            room.spawnPrefab(SpawnType.Player, player);

            room.votebansystem.addVote(1023, 1013);
            assert.ok(room.votebansystem.voted.get(player.id));

            await room.handleLeave(player);

            assert.ok(!room.votebansystem.voted.get(player.id));
        });

        it("Should despawn all of the player's components.", async () => {
            const room = new Hostable;
            const player = await room.handleJoin(1013);
            room.spawnPrefab(SpawnType.Player, player);

            assert.strictEqual(player.components.length, 3);
            assert.ok(player.components.every(Boolean));

            await room.handleLeave(player);

            assert.ok(!player.components.some(Boolean));
        });
    });

    describe("Hostable#handleReady", () => {
        it("Should handle a player readying up.", async () => {
            const room = new TestHost;
            const player = await room.handleJoin(1);

            room.handleReady(player);

            assert.ok(player.isReady);
        });
    });

    describe("Hostable#spawnComponent", () => {
        it("Should add a component to the map of net objects and push to the owner's components.", async () => {
            const room = new Hostable;
            const component = new MeetingHud(room, 1, room.id, {
                states: new Map,
            });

            assert.ok(!room.netobjects.has(1));
            assert.strictEqual(room.components.length, 0);

            room.spawnComponent(component);

            assert.ok(room.netobjects.has(1));
            assert.strictEqual(room.components.length, 1);
        });

        it("Should emit a component spawn event.", async () => {
            const room = new Hostable;
            const component = new MeetingHud(room, 1, room.id, {
                states: new Map,
            });
            let did_receive = false;

            room.on("component.spawn", () => {
                did_receive = true;
            });

            room.spawnComponent(component);

            assert.ok(did_receive);
        });

        it("Should do nothing if the component is already spawned.", async () => {
            const room = new Hostable;
            const component = new MeetingHud(room, 1, room.id, {
                states: new Map,
            });

            room.spawnComponent(component);

            let did_receive = false;

            room.on("component.spawn", () => {
                did_receive = true;
            });

            room.spawnComponent(component);

            assert.ok(!did_receive);
        });
    });

    describe("Hostable#despawnComponent", () => {
        it("Should remove the component from the map of net objects and remove from the owner's components.", async () => {
            const room = new Hostable;
            const component = new MeetingHud(room, 1, room.id, {
                states: new Map,
            });

            room.spawnComponent(component);

            assert.ok(room.netobjects.has(1));
            assert.strictEqual(room.components.length, 1);

            await room.despawnComponent(component);

            assert.ok(!room.netobjects.has(1));
            assert.strictEqual(room.components[0], null);
        });

        it("Should emit a component despawn event.", async () => {
            const room = new Hostable;
            const component = new MeetingHud(room, 1, room.id, {
                states: new Map,
            });
            room.spawnComponent(component);
            let did_receive = false;

            room.on("component.despawn", () => {
                did_receive = true;
            });

            await room.despawnComponent(component);

            assert.ok(did_receive);
        });
    });

    describe("Hostable#getAvailablePlayerID", () => {
        it("Should return the next player ID not taken by a player.", async () => {
            const room = new Hostable;
            const player1 = await room.handleJoin(1013);
            const player2 = await room.handleJoin(1014);
            const player3 = await room.handleJoin(1015);
            const player4 = await room.handleJoin(1016);

            room.spawnPrefab(SpawnType.Player, player1);
            room.spawnPrefab(SpawnType.Player, player2);
            room.spawnPrefab(SpawnType.Player, player3);
            room.spawnPrefab(SpawnType.Player, player4);

            const playerID = room.getAvailablePlayerID();

            assert.strictEqual(playerID, 4);
        });
    });

    describe("Hostable#spawnPrefab", () => {
        it("Should instantiate a map object for The Skeld.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.ShipStatus, room);

            assert.strictEqual(object.type, SpawnType.ShipStatus);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 1);

            assert.strictEqual(object.components[0].classname, "ShipStatus");

            assert.ok(room.netobjects.has(object.components[0].netid));
        });

        it("Should instantiate a meeting hud object.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.MeetingHud, room);

            assert.strictEqual(object.type, SpawnType.MeetingHud);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 1);

            assert.strictEqual(object.components[0].classname, "MeetingHud");

            assert.ok(room.netobjects.has(object.components[0].netid));
        });

        it("Should instantiate a map object for the dropship lobby.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.LobbyBehaviour, room);

            assert.strictEqual(object.type, SpawnType.LobbyBehaviour);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 1);

            assert.strictEqual(
                object.components[0].classname,
                "LobbyBehaviour"
            );

            assert.ok(room.netobjects.has(object.components[0].netid));
        });

        it("Should instantiate a game data object.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.GameData, room);

            assert.strictEqual(object.type, SpawnType.GameData);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 2);

            assert.strictEqual(object.components[0].classname, "GameData");
            assert.strictEqual(object.components[1].classname, "VoteBanSystem");

            assert.ok(room.netobjects.has(object.components[0].netid));
            assert.ok(room.netobjects.has(object.components[1].netid));
        });

        it("Should instantiate a player object.", async () => {
            const room = new Hostable;

            await room.handleJoin(1013);
            const object = room.spawnPrefab(SpawnType.Player, 1013);

            assert.strictEqual(object.type, SpawnType.Player);
            assert.strictEqual(object.ownerid, 1013);
            assert.strictEqual(object.flags, 1);
            assert.strictEqual(object.components.length, 3);

            assert.strictEqual(object.components[0].classname, "PlayerControl");
            assert.strictEqual(object.components[1].classname, "PlayerPhysics");
            assert.strictEqual(
                object.components[2].classname,
                "CustomNetworkTransform"
            );

            assert.ok(room.netobjects.has(object.components[0].netid));
            assert.ok(room.netobjects.has(object.components[1].netid));
            assert.ok(room.netobjects.has(object.components[2].netid));
        });

        it("Should instantiate a map object for Mira HQ.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.Headquarters, room);

            assert.strictEqual(object.type, SpawnType.Headquarters);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 1);

            assert.strictEqual(object.components[0].classname, "Headquarters");

            assert.ok(room.netobjects.has(object.components[0].netid));
        });

        it("Should instantiate a map object for Polus.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.PlanetMap, room);

            assert.strictEqual(object.type, SpawnType.PlanetMap);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 1);

            assert.strictEqual(object.components[0].classname, "PlanetMap");

            assert.ok(room.netobjects.has(object.components[0].netid));
        });

        it("Should instantiate a map object for the april fools' version of The Skeld.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.AprilShipStatus, room);

            assert.strictEqual(object.type, SpawnType.AprilShipStatus);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 1);

            assert.strictEqual(
                object.components[0].classname,
                "AprilShipStatus"
            );

            assert.ok(room.netobjects.has(object.components[0].netid));
        });

        it("Should instantiate a map object for Airship.", async () => {
            const room = new Hostable;

            const object = room.spawnPrefab(SpawnType.Airship, room);

            assert.strictEqual(object.type, SpawnType.Airship);
            assert.strictEqual(object.ownerid, -2);
            assert.strictEqual(object.flags, 0);
            assert.strictEqual(object.components.length, 1);

            assert.strictEqual(object.components[0].classname, "Airship");

            assert.ok(room.netobjects.has(object.components[0].netid));
        });
    });

    describe("Hostable#getPlayerByPlayerId", () => {
        it("Should retrieve a player by their player ID.", async () => {
            const room = new Hostable;
            const player = await room.handleJoin(1013);
            room.spawnPrefab(SpawnType.Player, player);

            assert.strictEqual(room.getPlayerByPlayerId(0), player);
        });

        it("Should return null if no player has the player ID in question.", () => {
            const room = new Hostable;

            assert.strictEqual(room.getPlayerByPlayerId(0), undefined);
        });
    });

    describe("Hostable#getPlayerByNetID", async () => {
        const room = new Hostable;
        const player = await room.handleJoin(1013);
        room.spawnPrefab(SpawnType.Player, player);

        it("Should retrieve a player by their player control component's netid.", async () => {
            assert.strictEqual(
                room.getPlayerByNetId(player.control.netid),
                player
            );
        });

        it("Should retrieve a player by their player physics component's netid.", async () => {
            assert.strictEqual(
                room.getPlayerByNetId(player.physics.netid),
                player
            );
        });

        it("Should retrieve a player by their custom network transform component's netid.", async () => {
            assert.strictEqual(
                room.getPlayerByNetId(player.transform.netid),
                player
            );
        });

        it("Should return null if there is no player with the netid.", async () => {
            assert.strictEqual(room.getPlayerByNetId(53), undefined);
        });
    });
});
