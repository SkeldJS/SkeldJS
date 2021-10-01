![Skeld JS client](https://raw.githubusercontent.com/SkeldJS/SkeldJS/master/asset/SkeldJSClient.png "Skeld JS")

## @skeldjs/client

This package contains a complete programmable Among Us client, and while it is one package of a bigger project, [skeldjs](https://github.com/skeldjs/SkeldJS), it is intended to be installed on its own with `npm install --save @skeldjs/client` or `yarn add @skeldjs/client`.

You can view auto-updating documentation for this package hosted at github pages at https://skeld.js.org/modules/client.html

## Basic Usage
### Join a game
```ts
const client = new SkeldjsClient("2021.4.25");

await client.connect("EU", "weakeyes");

await client.joinGame("ABCDEF");

await client.me.control.checkName("weakeyes");
await client.me.control.checkColor(ColorID.Blue);
```

### Host a game
```ts
const client = new SkeldjsClient("2021.4.25");

await client.connect("EU", "weakeyes");

await client.createGame({
    players: 10,
    map: skeldjs.MapID.TheSkeld,
    impostors: 2,
});

await client.me.control.setName("weakeyes");
await client.me.control.setColor(ColorID.Blue);
```

## Advanced Usage
### Host a game and say hello to everyone that joins
```ts
const client = new SkeldjsClient("2020.3.5.0");

await client.connect("EU", "weakeyes");

await client.createGame({
    players: 10,
    map: skeldjs.MapID.TheSkeld,
    impostors: 2,
});

await client.me.control.setName("weakeyes");
await client.me.control.setColor(ColorID.Blue);

client.on("player.setname", async ev => {
    client.me.control.chat("Hello, " + ev.name + "!");
});

```

### Search for games and join a random one
```ts
const client = new SkeldjsClient("2021.4.25");

await client.connect("EU", "weakeyes");

const games = await client.findGames();
const game = games[Math.floor(Math.random() * games.length)];

const code = await client.joinGame(game.code);

console.log("Joined " + game);
```
