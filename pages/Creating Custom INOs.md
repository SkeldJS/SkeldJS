# Creating Custom INOs
SkeldJS allows you to create your own, register, unregister and override your own
innernet objects (INOs).

## Ownership
An INO can belong to either the player or the room by default. Only the host can
update objects that belong to the room, and each player can only access objects
that they own.

The host can also generally update other player's objects, although it depends
whether this will have any effect.

## Hierarchy
An InnerNet Object has 1 or more components, where the first component is classed
as the entity and each component can reference each other. You only need to declare
INO components, as INOs are handled implicitly as the first component.

# INO Components
Components make up an INO, for all intents and purposes in skeldjs, an INO is just
an array of components.

## Skeleton
The general skeleton for an INO component object in skeldjs is as follows, although
should be extended significantly to provide methods and networking utilities.

```ts
export class MyFavouriteComponent<RoomType extends StatefulRoom> extends NetworkedObject<RoomType> {
    deserializeFromReader(
        reader: HazelReader,
        isSpawn: boolean
    ) {

    }

    serializeToWriter(
        writer: HazelWriter,
        isSpawn: boolean
    ) {

        return true;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {

    }

    processFixedUpdate(delta: number) {

    }

    processAwake() {

    }

    Destroy() {

    }
}
```

The two most important methods, `Deserialize` and `Serialize` determine how your
object will be networked, and you can use these methods to serialize and update
data on all clients. `isSpawn` signifies whether this is the first time the object
is being spawned, as you may want to have separate methods for serializing data
for spawns and data updates.

## Transferring Data
Data for an INO component can be transferred in 3 ways, each with their own purpose:

### Spawn
Data sent when the object is spawned is generally used for initially providing
information that isn't necessary to update constantly. For example, the [PlayerControl](https://github.com/codyphobe/among-us-protocol/blob/master/05_innernetobject_types/04_playercontrol.md)
object contains a boolean for whether the player is new to the game or not, but
this isn't present in the normal data update.

Sent via the [Spawn protocol message](https://github.com/codyphobe/among-us-protocol/blob/master/03_gamedata_and_gamedatato_message_types/04_spawn.md)
when the object is first spawned.

You can serialize this data with the `Serialize(writer, isSpawn)` method and
checking for `isSpawn` to be true, and you can handle it with the `Deserialize(reader, isSpawn)` method.

### Data
Usually used for syncing data instead of actual updates, and for more complicated
updates in general.

Sent via the [Data protocol message](https://github.com/codyphobe/among-us-protocol/blob/master/03_gamedata_and_gamedatato_message_types/01_data.md)
at most every fixed update cycle.

You can serialize this data with the `Serialize(writer, isSpawn)` method and
checking for `isSpawn` to be false, and you can handle it with the `Deserialize(reader, isSpawn)` method.

For `Serialize(writer, isSpawn)` to be called on your component, you must set your
component's `dirtyBit` to a number greater than 0.

### RPCs
Stands for **R**emote **P**rocedure **C**all, typically used for individual commands
that the client or host can send to perform specific operations. Can modify state
of the component. Can also be used for clients to send commands directly to the host,
for example the [CheckName Rpc](https://github.com/codyphobe/among-us-protocol/blob/master/04_rpc_message_types/05_checkname.md).

Can be sent either via the {@link StatefulRoom.broadcast} method on the room or with
the {@link StatefulRoom.messageStream}, and can be handled with the `async handleRemoteCall(rpc)`
method on the INO component.

## Lifecycle
SkeldJS also provides some useful lifecycle methods for INO components:

### `PreSerialize()`
Called before the serialize method, it allows you to prepare your component for
serialization, such as setting the `dirtyBit` to `1` before-hand.

### `processFixedUpdate(delta: number)`
Called on every fixed update cycle, and passes a `delta` argument indicating the
number of miliseconds passed since the last fixed update, somewhere around `20`.

The time delta can be used to make time-dependent behaviours, such as a ship system
like O2 or Reactor counting down.

### `processAwake()`
Called as soon as the component is spawned by SkeldJS (note: not when receiving
a spawn message). This can be used to introduce the component to the room.

You should **not** use the constructor to do this component's job, as innernet
objects should by default by component stateless from the room.

### `Destroy()`
Called as soon as the component is destroyed by SkeldJS. This is best used to
clean up any effects that the component had while in the room.

### Constructor
```ts
constructor(
    room: RoomType, // The room that the component belongs to
    spawnType: SpawnType, // The INO spawn id that the component is for (e.g. 4 if it's a Player component)
    netId: number, // The netId of the component
    ownerId: number, // The owner of the component
    flags: number, // The flags that the component was instantiated with
    data?: HazelReader | any // The data to instantiate the component with
) {
    super(room, spawnType, netId, ownerId, flags, data);
}
```

## Method Structure
As part of a good and consistent API, your component class should have 4 methods
for each action that can be done with your component:
* A private `_handleX(rpc: YourRpc)` method used for handling a received RPC.
* A private `_X()` method used for actually executing your action internally in skeldjs
* A private `_rpcX()` method used to actually network the rpc to the host or other clients
* A `X()` method to use as an API method, to call both `_X()` and `_rpcX()`.

For example, if you had a custom player component that had the ability to change
the shape of the player, you might want to have something like:

```ts
export enum PlayerShape {
    Square,
    Circle,
    Triangle
}

export class ShapeShifterPlayerControl<RoomType extends StatefulRoom> extends NetworkedObject<RoomType> {
    currentShape = PlayerShape.Square;

    deserializeFromReader(
        reader: HazelReader,
        isSpawn: boolean
    ) {
        this.currentShape = reader.uint8();
    }

    serializeToWriter(
        writer: HazelWriter,
        isSpawn: boolean
    ) {
        writer.uint8(this.currentShape);
        this.dirtyBit = 0;
        return true;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case ShapeShifterRpcTags.SetShape:
                await this._handleSetShape(rpc as SetShapeMessage);
                break;
        }
    }

    private async _handleSetShape(rpc: SetShapeMessage) {
        this._setShape(rpc.shape);

        // Emit custom events here
    }

    private _setShape(shape: PlayerShape) {
        this.currentShape = shape;
        this.dirtyBit = 1;
    }

    private _rpcSetShape(shape: PlayerShape) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetShapeMessage(shape)
            )
        );
    }

    setShape(shape: PlayerShape) {
        this._setShape(shape);

        // Emit custom events here

        this._rpcSetShape(shape);
    }
}
```

# Registering INOs
You can use the `room.registerPrefab(number, NetworkedObjectConstructor<NetworkedObject>[])`
method to register your INO on the game and to allow it to be spawned when the host
or server requests.

The first parameter is the [SpawnType](https://github.com/codyphobe/among-us-protocol/blob/master/01_packet_structure/06_enums.md#spawntype)
of the INO, you can override any built-in or previously registered INOs.

The second is an array of components in your INO, where the first component acts
as the entity and as such is a component of itself.
