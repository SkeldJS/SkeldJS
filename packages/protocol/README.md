## @skeldjs/protocol

This package contains important information about the Among Us network protocol, as well as tools to deserialise and serialise packets. While you can install it on its own with `npm install --save @skeldjs/protocol` or `yarn add @skeldjs/protocol`, it is one package of a bigger project, [skeldjs](https://github.com/skeldjs/SkeldJS).

You can view auto-updating documentation for this package hosted at github pages at https://skeld.js.org/modules/protocol.html

You can also view more detailed information about the protocol at https://github.com/codyphobe/among-us-protocol

## Basic Usage

It's recommended to keep a constant stream of packets going through the decoder, rather than picking out or sending one or two.

Parsing a packet in-place using the `parse` method is discouraged, as it does not provide sufficient intellisense for the messages.
### Listen for a join game packet going through the decoder.
```ts
const decoder = new PacketDecoder;

decoder.on(JoinedGameMessage, message => {
    console.log("Joined game", Int2Code(message.code) + "!");
});

const buffer = Buffer.from("0100020d0007a7317c8801000000010000000006000aa7317c880100", "hex");
decoder.write(buffer); // Joined game PKMKNP!
```
