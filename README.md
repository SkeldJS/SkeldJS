# Skeld JS

![Skeld JS](https://raw.githubusercontent.com/SkeldJS/SkeldJS/master/asset/SkeldJSMain.png "Skeld JS")

SkeldJS is a JavaScript implementation of the Among Us protocol, featuring several different projects, written in TypeScript.

The repository holds several key programs for automating development with Among Us.
* **Server** - Host your own Among Us server, complete with plugins and a Server-as-a-Host solution.
* **Client** - An Among Us client that allows you to host games, join games and act as a player programmatically.
* **Proxy** - A proxy with both a programmable client and an electron client, to inspect and modify packets in detail.

as well as a central `@skeldjs/skeldjs` package that contains a simple client API, and a server plugin API with support for Redis and multiple server nodes.

The repository also hosts utility packages for the packages listed above, that you can use individually.
* **Core** - An impartial core internal API for Among Us structures and game objects that are shared across all main projects.
* **Protocol** - Protocol interfaces with full parsing and composing.
* **Constant** - Enums & bitfields in Among Us.
* **Data** - Among Us game data & information.
* **Util** - Basic utility functions.

As well as the main and utility packages, the project also contains several packages to be used as additions or addons to the client package. These are installed separately from the client although are helpful in automating client development.
* **Pathfinding** - A* pathfinding implementation to get around the map, abstracted to be a seamless addition to the  client package.
* **Task Manager** - A tool used for managing task completion in the correct order .

You can view auto-updating documentation for all packages hosted at github pages at https://skeldjs.github.io/SkeldJS.

# Installation
## Main region server installation
### Prerequisites
* [Node.js >=15](https://nodejs.org)
* [NPM](https://npmjs.org) (Installs with nodejs)
* [Yarn](https://yarnpkg.com) (Can be installed with `npm install -g yarn` in a command prompt once `npm` has installed.)
* [Git](https://git-scm.org) (Optional)
* A command prompt

### Install repository and packages

#### If you have installed [Git](https://git-scm.org)

1. Open a command prompt in a folder of your choosing. See [here](https://helpdeskgeek.com/how-to/open-command-prompt-folder-windows-explorer/) for help on Windows.

2. Install the repository with `git clone https://github.com/SkeldJS/SkeldJS`

3. Enter the server install directory with `cd SkeldJS/packages/skeldjs`

4. Install packages for the repository with `yarn install`

#### If you haven't
1. Install the repository `.zip` by clicking the "Code > Download ZIP" button above. Or [click here](https://github.com/SkeldJS/SkeldJS/archive/master.zip).

2. Extract all contents of the downloaded `.zip` into a folder of your choosing. See [here](https://www.howtogeek.com/668409/how-to-zip-and-unzip-files-on-windows-10) for help on Windows.

3. Enter the folder where you extracted the `.zip` contents in a command prompt. See [here](https://helpdeskgeek.com/how-to/open-command-prompt-folder-windows-explorer/) for help on Windows.

4. Enter the server install directory with `cd packages/skeldjs`

5. Install packages for the repository with `yarn install`

### Configure and start
To configure the server, open `config.json` in in any text editor.

Insert plugins in the `plugins` directory.

Enter `npm start` in the command prompt to start the server.

### Connection
To connect, you can use `npm run set-server localhost 127.0.0.1`

Or alternatively, you can use any of the following programs developed by others.
* https://github.com/Koupah/Among-Us-Editor/releases
* https://github.com/andruzzzhka/CustomServersClient/releases

## NPM Packages
You can install individual packages through NPM as the `@skeldjs` scope/namespace.

### To install the client
```
npm install --save @skeldjs/client
or
yarn add @skeldjs/client
```

### To install the server
```
npm install --save @skeldjs/server
or
yarn add @skeldjs/server
```

### To install the proxy
```
npm install --save @skeldjs/proxy
or
yarn add @skeldjs/proxy
```

### To install utility packages
```
npm install --save @skeldjs/core
npm install --save @skeldjs/protocol
npm install --save @skeldjs/constant
npm install --save @skeldjs/types
npm install --save @skeldjs/util
or
yarn add @skeldjs/core
yarn add @skeldjs/protocol
yarn add @skeldjs/constant
yarn add @skeldjs/types
yarn add @skeldjs/util
```

# Notes
> The most comprehensive set of JavaScript protocol implementations for Among Us.

The following resources have been extremely useful in developing this project, and I suggest that you give the repositories a star where applicable.
* https://sus.wiki Easily the most useful resource to me, a wiki covering the entire among us protocol and basic flows.
* https://wireshark.org Tool for capturing individual game packets.
  * https://github.com/cybershard/wireshark-amongus Plugin for wireshark for quickly filtering and deserialising among us packets, extremely useful for quickly debugging issues.
* https://github.com/alexis-evelyn/Among-Us-Protocol/wiki The first wiki I found that got me interested.

This repository is held under the GPL-V3 license, meaning I am not responsible for any consequences that may come from using the packages in SkeldJS.
