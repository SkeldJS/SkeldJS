## How to use Events in SkeldJS

Events in SkeldJS are emitted by individual objects and components, but propagate throughout the tree, meaning you can attach listeners to the client to listen to events from all objects, and know where they are coming from.

For example, you can attach a listener to a specific player to know when their name has been updated.
```ts
player.on("player.setname", ev => {
    console.log(player.id, "set their name to", ev.data.name);
});
```
Or, you can attach a listener to the client to know when any player has their name updated.
```ts
client.on("player.setname", ev => {
    console.log(ev.data.player.id, "set their name to", ev.data.name);
});
```

Notice how the player is attached to the data of the event, so you know where the event came from and act accordingly.

For a list of events that you can listen to globally and what data they provide, see [SkeldjsClientEvents](/interfaces/client.skeldjsclientevents). You can see a list of events for each object in their class description in the docs.

## Advanced Usage

### Not currently a feature, follow [#11](https://github.com/SkeldJS/SkeldJS/issues/11).

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
Data inside events can also be modified as a way to "hook" into a procedure.

For example, you could change the name of a player before it's set.
```ts
client.on("player.checkname", ev => {
    ev.data.name = "chimpanzee";
});
```

Due to limitations in the Among us protocol, not every event can be "hooked" in any meaningful way. For example, modifying the data in the `player.setname` event won't have any effect on the player's name in question. So instead, you would have to change their name manually if you wanted to updated it.

```ts
client.on("player.setname", ev => {
    ev.data.player.control.setName("chimpanzee");
});
```
