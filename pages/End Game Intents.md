# End Game Intents
SkeldJS allows you to imperatively create the _intent_ for a game to end, that is,
you're telling SkeldJS that you want the game to end.

You can hook into them and cancel them, preventing them from actually causing a game
ending.

### Create Intent
You can use the {@link Hostable.registerEndGameIntent} method to register an intent,
and will be checked and ended on the next _fixed update_ cycle.

Note that end game intents don't guarantee that the game has ended or that it will
end.

### Example
SkeldJS uses end game intents internally (which also means you can cancel typical
end game behaviours).

```ts
if (aliveImpostors <= 0) {
    client.registerEndGameIntent(
        new EndGameIntent<PlayersVoteOutEndgameMetadata>(
            AmongUsEndGames.PlayersVoteOut,
            GameOverReason.HumansByVote,
            {
                exiled,
                aliveCrewmates,
                aliveImpostors
            }
        )
    );
}
```
This end-game intent is registered immediately after a meeting if there are 0
impostors remaining.

Notice how you can pass in metadata to make a more informed decision about whether
or not to cancel it when it comes to listening for it in an event.

### Cancelling intents
```ts
client.on("room.endgameintent", ev => {
    if (ev.intentName === AmongUsEndGames.PlayerVoteOut) {
        if (ev.metadata.aliveImpostors === 0) { // the intent was registered when the last impostor was voted out.
            ev.cancel();
        }
    }
});
```

### Built-In intents
You can access all built-in intent names via the {@link AmongUsEndGames} enum.
