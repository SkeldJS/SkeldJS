# Skeld JS

![Skeld JS](https://raw.githubusercontent.com/SkeldJS/SkeldJS/master/asset/SkeldJSMain.png "Skeld JS")

[![codecov](https://codecov.io/gh/SkeldJS/SkeldJS/branch/master/graph/badge.svg?token=UHMXQNX805)](https://codecov.io/gh/SkeldJS/SkeldJS)
[![license](https://img.shields.io/github/license/SkeldJS/SkeldJS)](https://github.com/skeldjs/SkeldJS)
[![Lint and Test](https://github.com/skeldjs/SkeldJS/workflows/Lint%20&%20Test/badge.svg)](https://github.com/SkeldJS/SkeldJS/actions?query=workflow%3A%22Lint+%26+Test%22)
[![Build](https://github.com/skeldjs/SkeldJS/workflows/Build/badge.svg)](https://github.com/SkeldJS/SkeldJS/actions?query=workflow%3A%22Build%22)
[![Docs](https://github.com/skeldjs/SkeldJS/workflows/Docs/badge.svg)](https://skeld.js.org)

### If you're looking for an Among Us server, check out my other project, [Hindenburg](https://github.com/skeldjs/Hindenburg)

SkeldJS is a JavaScript implementation of the Among Us protocol and game, written in TypeScript.

## Quick Start
* Install the client with `npm install -g @skeldjs/client`
* Check out the documentation at https://skeld.js.org
* Join the [discord server](https://discord.gg/8ewNJYmYAU) for help

See the [Packages](#packages) section for more installation information.

## Features
### 🕵️‍♀️ Unopinionated
SkeldJS is completely unopinionated about the structure or use-case of your program, and can be used to develop clients or servers with no preference to either.

### 🔌 Extensible
With the power of a heavily event-based design, SkeldJS gives you the ability to extend or modify just about every aspect of its behaviour, even allowing you to create custom objects or roles.

### 🧩 Complete
SkeldJS is a complete implementation of everything in Among Us, and is designed to remain as close as possible to how the game actually functions, meaning you are never out of sync with the official clients, or missing out on important features.

### ⚡ Fast
SkeldJS uses lots of caching techniques and does no more work than absolutely necessary to remain as close as possible to the game.

### <div style="display: flex; align-items: center;"><img style="margin-right: 8px" src="https://user-images.githubusercontent.com/60631511/142680560-76aad99f-5f6c-4ee1-8399-42d8f63fe31a.png" width=20> Written in TypeScript
SkeldJS is written in TypeScript, not only meaning that there is a much less chance of bugs in your code, but also that you get full editor support for SkeldJS.

## Packages
SkeldJS features several different packages, all focusing on different aspects of Among US development.

All of the below packages can be install with `npm install --save <package name>` or `yarn add <package name>`. For example, `npm install --save @skeldjs/client`.

### [@skeldjs/client](https://skeld.js.org/modules/client.html)
SkeldJS does feature its own client, allowing you to connect with either the official servers, or any other Among Us server, supporting the 2 modes of authentication.

### [@skeldjs/constant](https://skeld.js.org/modules/constant.html)
Several enums and constants in Among Us that are dumped directly from the game, and are used to ensure SkeldJS remains maintainable.

### [@skeldjs/core](https://skeld.js.org/modules/core.html)
The core structures of SkeldJS, including many networked structures found in Among Us, and is the foundation for the client or any servers to build from.

### [@skeldjs/data](https://skeld.js.org/modules/data.html)
Contains some useful general data to use in projects to make sense of task IDs, vent IDs, etc.

### [@skeldjs/dtls](https://skeld.js.org/modules/dtls.html)
A basic DTLS socket implementation to communicate with the Among Us servers securely.

### [@skeldjs/events](https://skeld.js.org/modules/events)
A utility package including a custom asynchronous and typed event emitter.

### [@skeldjs/lan](https://skeld.js.org/modules/lan.html)
A tool to be used with the SkeldJS client to search for and join games on the local network.

### [@skeldjs/pathfinding](https://skeld.js.org/modules/pathfinding.html)
A tool for the SkeldJS client to automatically navigate through the maps and make sense of the map colliders.

### [@skeldjs/protocol](https://skeld.js.org/modules/protocol.html)
Lots of structures representing Among Us protocol byte structures, as well as providing a utility [PacketDecoder](https://skeld.js.org/classes/protocol.PacketDecoder.html) class, acting similar to an event emitter.

### [@skeldjs/reactor](https://skeld.js.org/modules/reactor.html)
Reactor integration for the SkeldJS client to register mods with a reactor-combatible server.

### [@skeldjs/state](https://skeld.js.org/modules/state.html)
A light-weight wrapper on top of @skeldjs/core which takes in raw message buffers and translates them to be processed and to record state that trascends game data such as joining/leaving.

### [@skeldjs/text](https://skeld.js.org/modules/text.html)
Contains a utility class for generating TMP in a readable code-based format, as well as a TMP parser and transpiler to HTML.

### [@skeldjs/translations](https://skeld.js.org/modules/translations.html)
Allows you to convert game string IDs into a readable string in a language supported by Among Us, as well as supporting synthesising quick chat messages and cosmetic names.

### [@skeldjs/util](https://skeld.js.org/modules/util.html)
Several utility classes and functions used in SkeldJS, separated as another module as they are unopinionated and are used all throughout.

# Notes
> The most comprehensive set of JavaScript protocol implementations for Among Us.

The following resources have been extremely useful in developing this project, and I suggest that you give the repositories a star if possible.

* https://github.com/miniduikboot/Mini.Dumper - Useful for dumping game colliders for generating a pathfinding map.
* https://github.com/js6pak/Dumpostor - Useful for dumping all kinds of enums and general data about the game. (Although I use the [SkeldJS fork](https://github.com/SkeldJS/Dumpostor).)
* https://wireshark.org - Useful for recording UDP packets transmitted by Among Us.
* https://github.com/cybershard/wireshark-amongus - Plugin for Wireshark to onvert UDP packets into browsable Among Us structures.
* https://github.com/alexis-evelyn/Among-Us-Protocol/wiki - First Among Us protocol wiki, got me interested.
* https://github.com/roobscoob - For providing the code for authenticating with the Epic Online Services (EOS) api, see https://github.com/SkeldJS/SkeldJS/tree/master/packages/eos

This repository is held under the GPL3 license, meaning I am not responsible for any consequences that may come from using the packages in SkeldJS.
