# End Game Intents
SkeldJS allows you to create custom criteria for when a game should end, and also
allows you to hook into them and cancel them with events.

### Create Intent
You can use the {@link Hostable.registerEndGameIntent} method to register an intent,
where you can pass the intent name and the criteria for what to match.

The critera can either return a number or a promise of a number to indicate the
[GameOverReason](https://github.com/codyphobe/among-us-protocol/blob/master/01_packet_structure/06_enums.md#gameoverreason)
for why the game should end, similar to an exit code, or anything else and
it will be disregarded and the game will not end.

```ts
client.registerEndGameIntent("intent name", () => {
    // check for game end
});
```

### Canceling Game End Intents
```ts
client.on("room.endgameintent", event => {
    if (event.intentName === "o2 sabotage") {
        event.cancel(); // stop o2 sabotage from ending the game
    }
});
```

### Built-In intents
* `"o2 sabotage"` - Used when o2 timer reaches 0
* `"reactor sabotage"` - Used when reactor timer reaches 0
* `"players remaining"` - Used when there aren't enough players of a role to continue
playing the game
* `"tasks complete"` - Used when all crewmates have finished their tasks
