Join a game on EU servers, set colour & name and record player movement.

```ts
/*
Import everything from skeldjs. @skeldjs/client exports all useful structures and data to use in your code.
*/
import * as skeldjs from "@skeldjs/client";

(async () => { // Wrapper block for 'await' syntax, as top-level awaits are experimental.
    /*
    Create a new SkeldJS/Among Us client, with 2021.4.25 being the latest Among Us version.
    */
    const client = new skeldjs.SkeldjsClient("2021.4.25");

    /*
    Connect to Among Us on Europe servers, with a username of 'weakeyes'.
    */
    await client.connect("EU", "weakeyes");

    /*
    Join a game with the code ABCDEF.
    */
    await client.joinGame("ABCDEF");

    /*
    Ask the host to update your colour to Blue. If the colour is taken, the host will assign the next colour in the colour picker.
    */
    await client.me.control.checkColor(skeldjs.Color.Blue);

    /*
    Ask the host to update your name, this can be different from the username used in the `client.connect` function, although some private servers such as Impostor may prevent you from doing this.
    */
    await client.me.control.checkName("weakeyes");

    /*
    Attach a listener to the client for whenever a player moves in-game.
    */
    client.on("player.move", ev => {
        /*
        Log to the console the player that moved and also where they moved to.
        */
        console.log(ev.player.info.name, "moved to", ev.position);
    });
})();

```
