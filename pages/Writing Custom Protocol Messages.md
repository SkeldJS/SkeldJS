#### Note
##### Messages refer to any level of Hazel messages, be that [SendOption](https://github.com/codyphobe/among-us-protocol/blob/master/01_packet_structure/05_packet_types.md), [RootMessage](https://github.com/codyphobe/among-us-protocol/blob/master/02_root_message_types/README.md), [GameData](https://github.com/codyphobe/among-us-protocol/blob/master/03_gamedata_and_gamedatato_message_types/README.md) or [Rpc](https://github.com/codyphobe/among-us-protocol/blob/master/04_rpc_message_types/README.md), while packets refer to any set of bytes recieved from a socket.

## Writing Custom Protocol Messages
Messages in SkeldJS have been designed to be easy to both write and to register
to a client or server using the [PacketDecoder](https://skeld.js.org/SkeldJS/classes/protocol.packetdecoder.html)
class.

### Message Skeleton
The very basic structure of a message declaration is as follows:

```ts
class MyFavouriteMessage extends BaseMessage {
    static type = "lorem" as const; // The type of message that this is.
    type = "lorem" as const;

    static tag = 1 as const; // The hazel message tag.
    tag = 1 as const;

    constructor() {

    }

    static Deserialize(
        reader: HazelReader, // The message reader to read the message from.
        direction: MessageDirection, // The direction that this message is travelling in.
        decoder: PacketDecoder // The decoder that this message is going through.
    ) {
        // Should return an instance of MyFavouriteMessage
    }

    Serialize(
        writer: HazelWriter, // The message writer to write the message to.
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {

    }
}
```

A message declaration is just a class that optionally extends one of several
utility classes for standardisation, here being a very basic [BaseMessage](https://skeld.js.org/SkeldJS/classes/protocol.basemessage.html)
which just contains a utility for cancelling the message in some scenarios (such
as if it is relayed through a server, you might want to stop this behaviour).

Otherwise, SkeldJS also contains several other classes based off of the Among Us
protocol to extend:

* [BaseRootPacket](https://skeld.js.org/SkeldJS/classes/protocol.baserootpacket.html) -
used for writing protocol send options, see [here](https://github.com/codyphobe/among-us-protocol/blob/master/01_packet_structure/05_packet_types.md)
for more information.

* [BaseRootMessage](https://skeld.js.org/SkeldJS/classes/protocol.baserootmessage.html) -
used for writing root messages, see [here](https://github.com/codyphobe/among-us-protocol/blob/master/02_root_message_types/README.md)
for more information.

* [BaseGameDataMessage](https://skeld.js.org/SkeldJS/classes/protocol.basegamedatamessage.html) -
used for writing game data messages, see [here](https://github.com/codyphobe/among-us-protocol/blob/master/03_gamedata_and_gamedatato_message_types/README.md)
for more information.

* [BaseRpcMessage](https://skeld.js.org/SkeldJS/classes/protocol.baserpcmessage.html) -
used for writing remote call procedure messages, see [here](https://github.com/codyphobe/among-us-protocol/blob/master/04_rpc_message_types/README.md)
for more information.

Using the above classes rather than extending [BaseMessage](https://skeld.js.org/SkeldJS/classes/protocol.basemessage.html)
means that you don't need to specify the message type, since they will be set to `option`, `root`, `gamedata` and `rpc` respectfully if you extend them.

The Deserialize and Serialize methods take 3 parameters, a [HazelReader](https://skeld.js.org/SkeldJS/classes/util.hazelreader.html)
or [HazelWriter](https://skeld.js.org/SkeldJS/classes/util.hazelwriter.html)
instance respectfully, and also both take a [MessageDirection](https://skeld.js.org/SkeldJS/enums/protocol.messagedirection.html)
and [PacketDecoder](https://skeld.js.org/SkeldJS/classes/protocol.packetdecoder.html).

The Deserialize method should also return an instance of the message, while
Serialize should return nothing.

### Examples
Of course, SkeldJS contains plenty of examples and real-world usecases of writing
messages, https://github.com/SkeldJS/SkeldJS/tree/master/packages/protocol/lib/packets.

To see an example of a custom message in the wild, I have several examples on my
server implementation, Hindenburg, [here](https://github.com/edqx/Hindenburg/tree/master/src/packets)


## Registering and Listening to Messages
To register a custom message, you can use the [PacketDecoder#register](https://skeld.js.org/SkeldJS/classes/protocol.packetdecoder.html#register)
method, passing in the message class declaration itself. (Not an instance of the message)

To listen for a message to pass through the decoder, you can use the [PacketDecoder#on](https://skeld.js.org/SkeldJS/classes/protocol.packetdecoder.html#on)
method, passing in the message class declaration itself and a function with 3
optional parameters,
* An instance of the message class delcaration.
* The [direction](https://skeld.js.org/SkeldJS/enums/protocol.messagedirection.html)
that the message is travelling in.
* An optional parameter with the sender of the packet, if passed through the [PacetkDecoder#write](https://skeld.js.org/SkeldJS/classes/protocol.packetdecoder.html#write)
method

For example, you can do
```ts
const packetDecoder = new PacketDecoder;

packetDecoder.register(MyFavouriteMessage);

packetDecoder.on(MyFavouriteMessage, (message, direction, sender) => {
    console.log("Got my favourite message from %s", sender.username);
});
```
to register and listen for your favourite message ever.
