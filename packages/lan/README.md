## @skeldjs/lan

This package contains a way to search for games hosted locally for the SkeldJS client, meant to be installed separately with `npm install --save @skeldjs/lan` or `yarn add @skeldjs/lan`. It is also one package of a bigger project, [skeldjs](https://github.com/skeldjs/SkeldJS).

You can view auto-updating documentation for this package hosted at github pages at https://skeld.js.org/modules/lan.html

## Basic Usage

The LAN discovery class is separate from the skeldjs client class, giving you a class to listen for whenever a game is found.

```ts
const lanDiscovery = new LanDiscovery;

lanDiscovery.begin(); // start listening for games hosted locally

lanDiscovery.on("discovery.foundgame", foundGame => { // emitted whenever a game is found
    console.log("Found game: " + foundGame.name + " @ " + foundGame.ip + ":" + foundGame.port);
});
```

You could also wait for the first game to pop up:

```ts
const lanDiscovery = new LanDiscovery;
lanDiscovery.begin();

const foundGame = await lanDiscovery.wait("discovery.foundgame");

lanDiscovery.end(); // make sure to end the lan discovery when you've finished with it
```

A good integration with `@skeldjs/client`, for example, would look something along the lines of:
```ts
(async () => {
    const lanDiscovery = new LanDiscovery;
    const client = new SkeldjsClient("2021.4.25");

    client.on("client.disconnect", disconnect => {
        console.log("Client disconnected: %s", DisconnectReason[disconnect.reason]);
    });

    lanDiscovery.begin();
    const foundGame = await lanDiscovery.wait("discovery.foundgame");

    await client.connect(foundGame.ip, "weakeyes");

    await client.joinGame(foundGame.gameCode);

    await client.me?.control?.setName("weakeyes");
    await client.me?.control?.setColor(Color.Blue);
})();
```
