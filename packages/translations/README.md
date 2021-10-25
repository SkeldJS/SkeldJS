## @skeldjs/translations

Utlities for translation keys in Among Us, such as synthesising quick chat messages into a single string. Meant to be installed separately with `npm install --save @skeldjs/translations` or `yarn add @skeldjs/translations`, and is one package of a bigger project, [skeldjs](https://github.com/skeldjs/SkeldJS).

You can view auto-updating documentation for this package hosted at github pages at https://skeld.js.org/modules/translations.html

## Basic Usage

```ts
client.on("meeting.votingcomplete", ev => {
    if (ev.ejected) {
        console.log(translation.formatString(StringNames.ExileTextNonConfirm, [ ev.ejected ], Language.English));
    } else {
        if (ev.tie) {
            console.log(translation.getTranslation(StringNames.NoExileTie, Language.English));
        } else {
            console.log(translation.getTranslation(StringNames.NoExileSkip, Language.English));
        }
    }
});
```

## Advanced Usage

```ts
import { Int2Code } from "@skeldjs/util";
import { TranslationController } from "@skeldjs/translations";

import * as skeldjs from "@skeldjs/client";
import { Language } from "@skeldjs/client";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.6.30s");
    const translation = new TranslationController(client);

    console.log("Connecting to server..");
    await client.connect("EU", "weakeyes");

    console.log("Creating game..");
    const code = await client.createGame(
        {
            maxPlayers: 10,
            map: skeldjs.GameMap.MiraHQ,
            numImpostors: 2
        }
    );

    client.on("player.quickchat", ev => {
        console.log(translation.serializeQuickChat(ev.chatMessage, Language.English));
    });

    console.log(
        "Created game @ " +
            Int2Code(code as number) +
            " on EU servers"
    );
})();
```
