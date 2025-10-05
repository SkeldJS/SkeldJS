## How to Use Events in SkeldJS

Events in SkeldJS are emitted by individual objects and components, but propagate throughout the tree, meaning you can attach listeners to the client to listen to events from all objects, and know where they are coming from.

For example, you can attach a listener to a specific player to know when their name has been updated.
```ts
player.on("player.setname", ev => {
    console.log(player.id, "set their name to", ev.name);
});
```
Or, you can attach a listener to the client to know when any player has their name updated.
```ts
client.on("player.setname", ev => {
    console.log(ev.player.id, "set their name to", ev.name);
});
```

Notice how the player is attached to the data of the event, so you know where the event came from and act accordingly.

For a list of events that you can listen to globally and what data they provide, see [SkeldjsClientEvents](/interfaces/client.skeldjsclientevents). You can see a list of events for each object in their class description in the docs.

For a list of events to listen to, see [below].

## Advanced Usage

Events can be cancelled to prevent something from happening.

### Cancelling

For example, you might want to prevent a system from being sabotaged.
```ts
client.on("system.sabotage", ev => {
    if (system.systemType === SystemType.O2) {
        ev.cancel();
    }
})
```

### Hooking
Some events let you modify the data as a way to "hook" into a procedure. You will probably also have to cancel the event too, in order to prevent what would normally happen.

For example, you could change the name of a player before it's set.
```ts
client.on("player.checkname", ev => {
    ev.setName(ev.name);
});
```

Some events have special functions that you can find out on the documentation for them.

For example, the check name event lets you revert the altered name back to the original name.
```ts
client.on("player.checkname", ev => {
    ev.revert();
});
```

Due to limitations in the Among us protocol, not every event can be "hooked" in any meaningful way. For example, modifying the data in the `player.setname` event won't have any effect on the player's name in question. So instead, you would have to change their name manually if you wanted to updated it.

```ts
client.on("player.setname", ev => {
    ev.player.control.setName("chimpanzee");
});
```

# Event List

## Client

## Room
### Security Cameras
* {@link SecurityCameraJoinEvent | `security.cameras.join`}
* {@link SecurityCameraLeaveEvent | `security.cameras.leave`}

### Decontamination
* {@link DeconDoorsCloseEvent | `decon.doors.close`}
* {@link DeconDoorsOpenEvent | `decon.doors.open`}
* {@link DeconEnterEvent | `decon.enter`}
* {@link DeconExitEvent | `decon.exit`}

### Doors
* {@link DoorsDoorCloseEvent | `doors.close`}
* {@link DoorsDoorOpenEvent | `doors.open`}

### Electrical
* {@link ElectricalSwitchFlipEvent | `electrical.switchflip`}

### Game Data
* {@link GameDataAddPlayerEvent | `gamedata.addplayer`}
* {@link GameDataRemovePlayerEvent | `gamedata.removeplayer`}
* {@link GameDataSetTasksEvent | `gamedata.settasks`}

### Heli Sabotage
* {@link HeliSabotageConsoleCloseEvent | `heli.consoles.close`}
* {@link HeliSabotageConsoleOpenEvent | `heli.consoles.open`}
* {@link HeliSabotageConsoleCompleteEvent | `heli.consoles.complete`}
* {@link HeliSabotageConsolesResetEvent | `heli.consoles.reset`}

### Mira HQ Comms
* {@link HqHudConsoleCloseEvent | `hqhud.consoles.close`}
* {@link HqHudConsoleCompleteEvent | `hqhud.consoles.complete`}
* {@link HqHudConsoleOpenEvent | `hqhud.consoles.open`}
* {@link HqHudConsolesResetEvent | `hqhud.consoles.reset`}

### Med Scan
* {@link MedScanJoinQueueEvent | `medscan.joinqueue`}
* {@link MedScanLeaveQueueEvent | `medscan.leavequeue`}

### Meetings
* {@link MeetingHudClearVoteEvent | `meeting.clearvote`}
* {@link MeetingHudCloseEvent | `meeting.close`}
* {@link MeetingHudVoteCastEvent | `meeting.castvote`}
* {@link MeetingHudVotingCompleteEvent | `meeting.votingcomplete`}

### Moving Platform
* {@link MovingPlatformPlayerUpdateEvent | `movingplatform.updateplayer`}

### Components
* {@link ComponentDespawnEvent | `component.despawn`}
* {@link ComponentSpawnEvent | `component.spawn`}

### Oxygen
* {@link O2ConsolesCompleteEvent | `o2.consoles.complete`}
* {@link O2ConsolesClearEvent | `o2.consoles.clear`}

### Players
* {@link PlayerCheckColorEvent | `player.checkcolor`}
* {@link PlayerCheckMurderEvent | `player.checkmurder`}
* {@link PlayerCheckNameEvent | `player.checkname`}
* {@link PlayerCheckProtectEvent | `player.checkprotect`}
* {@link PlayerClimbLadderEvent | `player.climbladder`}
* {@link PlayerCompleteTaskEvent | `player.completetask`}
* {@link PlayerDieEvent | `player.die`}
* {@link PlayerEnterVentEvent | `player.entervent`}
* {@link PlayerExitVentEvent | `player.exitvent`}
* {@link PlayerJoinEvent | `player.join`}
* {@link PlayerLeaveEvent | `player.leave`}
* {@link PlayerMoveEvent | `player.move`}
* {@link PlayerMurderEvent | `player.murder`}
* {@link PlayerProtectEvent | `player.protect`}
* {@link PlayerReadyEvent | `player.ready`}
* {@link PlayerRemoveProtectionEvent | `player.removeprotection`}
* {@link PlayerReportDeadBodyEvent | `player.reportbody`}
* {@link PlayerRevertShapeshiftEvent | `player.revertshapeshift`}
* {@link PlayerSceneChangeEvent | `player.scenechange`}
* {@link PlayerSendChatEvent | `player.chat`}
* {@link PlayerSendQuickChatEvent | `player.quickchat`}
* {@link PlayerSetColorEvent | `player.setcolor`}
* {@link PlayerSetHatEvent | `player.sethat`}
* {@link PlayerSetAuthoritativeEvent | `player.setauthority`}
* {@link PlayerSetNameEvent | `player.setname`}
* {@link PlayerSetNameplateEvent | `player.setnameplate`}
* {@link PlayerSetPetEvent | `player.setpet`}
* {@link PlayerSetRoleEvent | `player.setrole`}
* {@link PlayerSetSkinEvent | `player.setskin`}
* {@link PlayerSetStartCounterEvent | `player.setstartcounter`}
* {@link PlayerSetVisorEvent | `player.setvisor`}
* {@link PlayerShapeshiftEvent | `player.shapeshift`}
* {@link PlayerSnapToEvent | `player.snapto`}
* {@link PlayerSpawnEvent | `player.spawn`}
* {@link PlayerStartMeetingEvent | `player.startmeeting`}
* {@link PlayerSyncSettingsEvent | `player.syncsettings`}
* {@link PlayerUseMovingPlatformEvent | `player.usemovingplatform`}

### Reactor
* {@link ReactorConsoleAddEvent | `reactor.consoles.add`}
* {@link ReactorConsoleRemoveEvent | `reactor.consoles.remove`}
* {@link ReactorConsolesResetEvent | `reactor.consoles.reset`}

### Room
* {@link RoomAssignRolesEvent | `room.assignroles`}
* {@link RoomEndGameIntentEvent | `room.endgameintent`}
* {@link RoomprocessFixedUpdateEvent | `room.fixedupdate`}
* {@link RoomGameEndEvent | `room.gameend`}
* {@link RoomGameStartEvent | `room.gamestart`}
* {@link RoomSetPrivacyEvent | `room.setprivacy`}

### Systems
* {@link SystemRepairEvent | `system.repair`}
* {@link SystemSabotageEvent | `system.sabotage`}
