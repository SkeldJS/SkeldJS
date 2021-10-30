import { HazelReader } from "@skeldjs/util";

import {
    AlterGameTag,
    GameState,
    Hostable,
    HostableEvents,
    HostableOptions,
    PlayerSceneChangeEvent,
    RoomSetPrivacyEvent,
    SpawnFlag,
    SpawnType
} from "@skeldjs/core";

import {
    HostGameMessage,
    JoinGameMessage,
    RemovePlayerMessage,
    StartGameMessage,
    GameDataToMessage,
    JoinedGameMessage,
    MessageDirection,
    GameSettings,
    EndGameMessage,
    SceneChangeMessage,
    DespawnMessage,
    SpawnMessage,
    RpcMessage,
    DataMessage,
    AlterGameMessage,
    ReadyMessage,
} from "@skeldjs/protocol";

export type SkeldjsStateManagerEvents = HostableEvents;

export class SkeldjsStateManager<
    T extends SkeldjsStateManagerEvents = SkeldjsStateManagerEvents
> extends Hostable<T> {
    clientId: number;

    constructor(options: HostableOptions = {}) {
        super({ doFixedUpdate: false, ...options });

        this.clientId = 0;

        this.decoder.on(HostGameMessage, (message, direction) => {
            if (direction === MessageDirection.Clientbound) {
                this.setCode(message.code);
            }
        });

        this.decoder.on(JoinGameMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleJoin(message.clientid);
                await this.setHost(message.hostid);
            }
        });

        this.decoder.on(StartGameMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleStart();
            }
        });

        this.decoder.on(EndGameMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleEnd(message.reason);
            }
        });

        this.decoder.on(RemovePlayerMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleLeave(message.clientid);
                await this.setHost(message.hostid);
            }
        });

        this.decoder.on(
            GameDataToMessage,
            async (message, direction, context) => {
                if (
                    direction === MessageDirection.Clientbound &&
                    message.code === this.code &&
                    message.recipientid === this.clientId
                ) {
                    for (const child of message._children) {
                        this.decoder.emitDecoded(child, direction, context);
                    }
                }
            }
        );

        this.decoder.on(JoinedGameMessage, async (message, direction) => {
            if (direction === MessageDirection.Clientbound) {
                this.clientId = message.clientid;
                this.state = GameState.NotStarted;
                await this.setCode(message.code);
                await this.setHost(message.hostid);
                await this.handleJoin(message.clientid);
                for (let i = 0; i < message.others.length; i++) {
                    await this.handleJoin(message.others[i]);
                }
            }
        });


        this.decoder.on(AlterGameMessage, async message => {
            if (message.alterTag === AlterGameTag.ChangePrivacy) {
                const messagePrivacy = message.value ? "public" : "private";
                const oldPrivacy = this.privacy;
                const ev = await this.emit(
                    new RoomSetPrivacyEvent(
                        this,
                        message,
                        oldPrivacy,
                        messagePrivacy
                    )
                );

                if (ev.alteredPrivacy !== messagePrivacy) {
                    await this.broadcast([], true, undefined, [
                        new AlterGameMessage(
                            this.code,
                            AlterGameTag.ChangePrivacy,
                            ev.alteredPrivacy === "public" ? 1 : 0
                        )
                    ]);
                }

                if (ev.alteredPrivacy !== oldPrivacy) {
                    this._setPrivacy(ev.alteredPrivacy);
                }
            }
        });

        this.decoder.on(DataMessage, message => {
            const component = this.netobjects.get(message.netid);

            if (component) {
                const reader = HazelReader.from(message.data);
                component.Deserialize(reader);
            }
        });

        this.decoder.on(RpcMessage, async message => {
            const component = this.netobjects.get(message.netid);

            if (component) {
                try {
                    await component.HandleRpc(message.data);
                } catch (e) {
                    void e;
                }
            }
        });

        this.decoder.on(SpawnMessage, message => {
            const ownerClient = this.players.get(message.ownerid);

            if (message.ownerid > 0 && !ownerClient) {
                return;
            }

            this.spawnPrefab(
                message.spawnType,
                message.ownerid,
                message.flags,
                message.components,
                false,
                false
            );
        });

        this.decoder.on(DespawnMessage, message => {
            const component = this.netobjects.get(message.netid);

            if (component) {
                this._despawnComponent(component);
            }
        });

        this.decoder.on(SceneChangeMessage, async message => {
            const player = this.players.get(message.clientid);

            if (player) {
                if (message.scene === "OnlineGame") {
                    player.inScene = true;

                    const ev = await this.emit(
                        new PlayerSceneChangeEvent(
                            this,
                            player,
                            message
                        )
                    );

                    if (ev.canceled) {
                        player.inScene = false;
                    } else {
                        if (this.hostIsMe) {
                            await this.broadcast(
                                this._getExistingObjectSpawn(),
                                true,
                                player
                            );

                            this.spawnPrefab(
                                SpawnType.Player,
                                player.clientId,
                                SpawnFlag.IsClientCharacter
                            );

                            this.host?.control?.syncSettings(this.settings);
                        }
                    }
                }
            }
        });

        this.decoder.on(ReadyMessage, message => {
            const player = this.players.get(message.clientid);

            if (player) {
                player.ready();
            }
        });
    }

    protected _reset() {
        this.players.clear();
        this.netobjects.clear();
        this.stream = [];
        this.code = 0;
        this.hostId = 0;
        this.settings = new GameSettings;
        this.counter = -1;
        this.privacy = "private";
    }
}
