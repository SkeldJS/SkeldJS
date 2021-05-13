## @skeldjs/pathfinding

This package contains a useful pathfinding tool for the SkeldJS client, meant to be installed separately as an extension to [@skeldjs/client](https://npmjs.com/packages/@skeldjs/client) with `npm install --save @skeldjs/pathfinding` or `yarn add @skeldjs/pathfinding`. It is also one package of a bigger project, [skeldjs](https://github.com/skeldjs/SkeldJS).

You can view auto-updating documentation for this package hosted at github pages at https://skeldjs.github.io/SkeldJS/modules/pathfinding.html

## Basic Usage

### Go to a location or player
```ts
const pathfinder = new SkeldjsPathfinder(client);

pathfinder.go({ x: 5, y: 5 });
// or
pathfinder.go(player);
```
x
### Go to a vent and enter it
```ts
pathfinder.vent(TheSkeldVent.Cafeteria);
await pathfinder.wait("pathfinding.end");

client.me.physics.entervent(TheSkeldVent.Cafeteria);
```

### Follow a player
```ts
pathfinder.follow(player);
```

## Advanced Usage
### Follow a player but stop when you get too close
```ts
pathfinder.follow(player);

pathfinder.on("engine.move", ev => {
    const position = ev.position;
    const player_pos = player.transform.position;

    const dist = Math.hypot(
        position.x - player_pos.x,
        position.y - player_pos.y
    );

    if (dist < 1) {
        ev.cancel();
    }
});
```
