# Client & Core
## Client
* `client.disconnect` - Emitted when the client gets disconnected.
* `client.packet` - Emitted after a client has received and processed a packet.
* `client.fixedupdate` - Emitted before the client sends data from a FixedUpdate interval.

## Game
* `game.start` - Emitted when a game starts.
* `game.end` - Emitted when a game ends.

## Networkable
* `component.spawn` - Emitted when a component is spawned.
* `component.despawn` - Emitted when a component is despawned.

## PlayerData
* `player.ready` - Emitted when a player is readyed ud.
* `player.join` - Emitted when a player joins. (Not necessarily spawned.)
* `player.leave` - Emitted when a player leaves.
* `player.sethost` - Emitted when a player is made the host.
* `player.scenechange` - Emitted when a player changes scene.

## GameData
* `gamedata.addplayer` - Emitted when a player is added to GameData.
* `gamedata.removeplayer` - Emitted when a player is removed from GameData.
* `gamedata.settasks` - Emitted when a player's tasks are updated.

## MeetingHud
* `meetinghud.votecast` - Emitted when a vote is cast.
* `meetinghud.voteclear` - Emitted when your vote is cleared.
* `meetinghud.votingcomplete` - Emitted when voting is completed.
* `meetinghud.close` - Emitted when the meeting hud closes.

## PlayerControl
* `player.completetask` - Emitted when a player completes a task.
* `player.setname` - Emitted when a player sets their name.
* `player.setcolor` - Emitted when a player sets their color.
* `player.sethat` - Emitted when a player sets their hat.
* `player.setskin` - Emitted when a player sets their skin.
* `player.setpet` - Emitted when a player sets their pet.
* `player.syncsettings` - Emitted when the host updates settings.
* `player.setstartcounter` - Emitted when the host updates the start counter.
* `player.setimpostors` - Emitted when the host sets the impostors.
* `player.murder` - Emitted when an impostor murders another player.
* `player.meeting` - Emitted when a player calls a meeting.
* `player.chat` - Emitted when the player sends a chat message.

## PlayerPhysics
* `player.entervent` - Emitted when a player enters a vent.
* `player.exitvent` - Emitted when a palyer exits a vent.

## CustomNetworkTransform
* `player.move` - Emitted when a player moves.
* `player.snapto` - Emitted when a player snaps to a position.

## Systems
* `system.sabotage` - Emitted when a system is sabotaged.
* `system.repair` - Emitted when a system is repaired.

### O2 System
* `o2.consoles.complete` - Emitted when an o2 console is completed.
* `o2.consoles.clear` - Emitted when the o2 consoles are cleared.

### Security System
* `security.cameras.join` - Emitted when a player joins cameras.
* `security.cameras.leave` - Emitted when a player leaves cameras.

### Switch system
* `electrical.switches.flip` - Emitted when a player flicks an electrical switch.

### HQ Hud System
* `hqhud.consoles.reset` - Emitted when comms consoles are reset.
* `hqhud.consoles.open` - Emitted when a comms console is opened.
* `hqhud.consoles.close` - Emitted when a comms console is closed.
* `hqhud.consoles.complete` - Emitted when a comms console is completed.

### AutoDoors
* `doors.open` - Emitted when a door opens.
* `doors.close` - Emitted when a door closes.

# Pathfinding
## SkeldjsPathfinder
* `pathfinding.start` - Emitted when the pathfinder starts.
* `pathfinding.stop` - Emitted when the pathfinder is stopped or reaches its destination.
* `pathfinding.pause` - Emitted when the pathfinder is paused.

* `engine.recalculate` - Emitted when the pathfinder recalculates its path.
