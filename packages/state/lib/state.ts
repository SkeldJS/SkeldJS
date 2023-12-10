import { HazelReader } from "@skeldjs/util";

import {
    AlterGameTag,
    GameState,
    Hostable,
    HostableConfig,
    HostableEvents,
    Platform,
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
    PlatformSpecificData,
    PlayerJoinData,
    PacketDecoder
} from "@skeldjs/protocol";

export type SkeldjsStateManagerEvents<T extends SkeldjsStateManager = any> = HostableEvents<T>;

export class SkeldjsStateManager<
    T extends SkeldjsStateManagerEvents = SkeldjsStateManagerEvents
> extends Hostable<T> {
    protected _cachedPlatform?: PlatformSpecificData;
    protected _cachedName?: string;

    clientId: number;
    decoder: PacketDecoder;

    constructor(config: HostableConfig = {}) {
        super({ doFixedUpdate: false, ...config });

        this.clientId = 0;
        this.decoder = new PacketDecoder;

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
                await this.setHost(message.hostId);
                await this.handleJoin(new PlayerJoinData(
                    message.clientId,
                    message.playerName,
                    message.platform,
                    message.playerLevel,
                    message.puid,
                    message.friendCode
                ));
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
                await this.setHost(message.hostId);
                await this.handleLeave(message.clientId);
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
                        this.decoder.emit(child, direction, context);
                    }
                }
            }
        );

        this.decoder.on(JoinedGameMessage, async (message, direction) => {
            if (direction === MessageDirection.Clientbound) {
                this.clientId = message.clientId;
                this.gameState = GameState.NotStarted;
                await this.setCode(message.code);
                await this.setHost(message.hostId);
                await this.handleJoin(new PlayerJoinData(
                    message.clientId,
                    this._cachedName || "SkeldJS",
                    this._cachedPlatform || new PlatformSpecificData(Platform.StandaloneSteamPC, "Steam"),
                    0,
                    "",
                    ""
                ));
                for (let i = 0; i < message.otherPlayers.length; i++) {
                    await this.handleJoin(message.otherPlayers[i]);
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
                    await this.broadcast([], [
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
            const component = this.netobjects.get(message.netId);

            if (component) {
                const reader = HazelReader.from(message.data);
                component.Deserialize(reader);
            }
        });

        this.decoder.on(RpcMessage, async message => {
            const component = this.netobjects.get(message.netId);

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

            this.spawnPrefabOfType(
                message.spawnType,
                message.ownerid,
                message.flags,
                message.components,
                false,
                false
            );
        });

        this.decoder.on(DespawnMessage, message => {
            const component = this.netobjects.get(message.netId);

            if (component) {
                this._despawnComponent(component);
            }
        });

        this.decoder.on(SceneChangeMessage, async message => {
            const player = this.players.get(message.clientId);

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
                                this.getExistingObjectSpawn(),
                                undefined,
                                [ player ]
                            );

                            this.spawnPrefabOfType(
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
            const player = this.players.get(message.clientId);

            if (player) {
                player.setReady();
            }
        });
    }

    protected _reset() {
        this.players.clear();
        this.netobjects.clear();
        this.messageStream = [];
        this.code = 0;
        this.hostId = 0;
        this.settings = new GameSettings;
        this.counter = -1;
        this.privacy = "private";
    }
}
