# Skeld JS

![Skeld JS](https://raw.githubusercontent.com/SkeldJS/SkeldJS/master/asset/SkeldJSMain.png "Skeld JS")

[![codecov](https://codecov.io/gh/SkeldJS/SkeldJS/branch/master/graph/badge.svg?token=UHMXQNX805)](https://codecov.io/gh/SkeldJS/SkeldJS)
[![license](https://img.shields.io/github/license/SkeldJS/SkeldJS)](https://github.com/skeldjs/SkeldJS)
[![Lint and Test](https://github.com/skeldjs/SkeldJS/workflows/Lint%20&%20Test/badge.svg)](https://github.com/SkeldJS/SkeldJS/actions?query=workflow%3A%22Lint+%26+Test%22)
[![Build](https://github.com/skeldjs/SkeldJS/workflows/Build/badge.svg)](https://github.com/SkeldJS/SkeldJS/actions?query=workflow%3A%22Build%22)
[![Docs](https://github.com/skeldjs/SkeldJS/workflows/Docs/badge.svg)](https://skeld.js.org/SkeldJS)


## The SkeldJS server has been removed in favour of my other project, [Hindenburg](https://github.com/edqx/Hindenburg)

SkeldJS is a JavaScript implementation of the Among Us protocol, featuring several different projects, written in TypeScript.

The repository holds several key programs for automating development with Among Us.
* **Client** - An Among Us client that allows you to host games, join games and act as a player programmatically.
* **Proxy** - A proxy with both a programmable client and an electron client, to inspect and modify packets in detail.

The repository also hosts utility packages for the packages listed above, that you can use individually.
* **State** - A state manager taking in both inbound and outbound packets.
* **Core** - An impartial core internal API for Among Us structures and game objects that are shared across all main projects.
* **Protocol** - Protocol interfaces with full parsing and composing.
* **Constant** - Enums & bitfields in Among Us.
* **Data** - Among Us game data & information.
* **Util** - Basic utility functions.

As well as the main and utility packages, the project also contains several packages to be used as additions or addons to the client package. These are installed separately from the client although are helpful in automating client development.
* **Pathfinding** - A* pathfinding implementation to get around the map, abstracted to be a seamless addition to the client package.
* **Task Manager** - A tool used for managing task completion in the correct order.
* **Reactor** - Implementation of the Reactor modded handshake for skeldjs.

You can view auto-updating documentation for all packages hosted at github pages at https://skeld.js.org/SkeldJS.

### Discord Server
SkeldJS now has a discord server where you can get help with installing, get help
with usage and talk about changes.

Invite: https://discord.gg/8ewNJYmYAU
## NPM Packages
You can install individual packages through NPM as the `@skeldjs/` scope/namespace.

### To install the client
```
npm install --save @skeldjs/client
or
yarn add @skeldjs/client
```

### To install the proxy
```
npm install --save @skeldjs/proxy
or
yarn add @skeldjs/proxy
```

### To install client tools
```
npm install --save @skeldjs/pathfinding
npm install --save @skeldjs/tasks
npm install --save @skeldjs/reactor
or
yarn add @skeldjs/pathfinding
yarn add @skeldjs/tasks
yarn add @skeldjs/reactor
```

### To install utility packages
```
npm install --save @skeldjs/state
npm install --save @skeldjs/core
npm install --save @skeldjs/protocol
npm install --save @skeldjs/constant
npm install --save @skeldjs/data
npm install --save @skeldjs/util
or
yarn add @skeldjs/state
yarn add @skeldjs/core
yarn add @skeldjs/protocol
yarn add @skeldjs/constant
yarn add @skeldjs/data
yarn add @skeldjs/util
```

# Notes
> The most comprehensive set of JavaScript protocol implementations for Among Us.

The following resources have been extremely useful in developing this project, and I suggest that you give the repositories a star where applicable.

* https://github.com/miniduikboot/Mini.Dumper Very helpful Among Us mod for dumping general game information, used extensively for `@skeldjs/data` and colliders for `@skeldjs/pathfinding`.
* https://sus.wiki Easily the most useful resource to me, a wiki covering the entire among us protocol and basic flows.
* https://wireshark.org Tool for capturing individual game packets.
  * https://github.com/cybershard/wireshark-amongus Plugin for wireshark for quickly filtering and deserializing among us packets, extremely useful for quickly debugging issues.
* https://github.com/alexis-evelyn/Among-Us-Protocol/wiki The first wiki I found that got me interested.

Also credit to the NodePolus people who told me my code was cringe, I've tried my best to refactor and earn your approval. There's a long way to go, still 😔.

This repository is held under the GPL-V3 license, meaning I am not responsible for any consequences that may come from using the packages in SkeldJS.
