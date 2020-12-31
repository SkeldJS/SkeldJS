import { EventEmitter } from "events"

import {
    GameDataMessage,
    SpawnMessage,
    GameOptions
} from "@skeldjs/protocol"

import {
    Code2Int,
    HazelBuffer,
    sleep
} from "@skeldjs/util"

import {
    Airship,
    AprilShipStatus,
    CustomNetworkTransform,
    GameData,
    Headquarters,
    LobbyBehaviour,
    MeetingHud,
    PlanetMap,
    PlayerControl,
    PlayerPhysics,
    ShipStatus,
    VoteBanSystem
} from "./component"

import {
    Opcode,
    MessageID,
    SpawnID,
    DisconnectReason,
    PayloadTag
} from "@skeldjs/constant"

import { Global } from "./Global"
import { Heritable } from "./Heritable"
import { Networkable } from "./Networkable"
import { PlayerData } from "./PlayerData"
import { Hostable } from "./Hostable"

import { SpawnPrefabs } from "./prefabs"

export type PlayerDataResolvable = number|PlayerData|PlayerControl;

export interface SpawnObject {
    type: number;
    ownerid: number;
    flags: number;
    components: Networkable[];
}

export interface Room {}

export class Room extends Global {
    objects: Map<number, Heritable>;
    netobjects: Map<number, Networkable>;

    code: number;

    hostid: number;

    private _incr_netid: number;
    
    settings: GameOptions;
    counter: number;

    private _started: boolean;

    constructor(public readonly client: Hostable, code: string|number) {
        super(null);

        this.objects = new Map;
        this.netobjects = new Map;

        this.objects.set(-2, this);

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.room = this;

        this._incr_netid = 0;
    }

    emit(event: string, ...args: any[]): boolean {
        this.client.emit(event, this, ...args);

        return EventEmitter.prototype.emit.apply(this, ...args);
    }
    
    private get incr_netid() {
        this._incr_netid++;

        return this._incr_netid;
    }

    get me() {
        return this.players.get(this.client.clientid);
    }

    get host() {
        return this.players.get(this.hostid);
    }

    get started() {
        return this._started;
    }

    get players() {
        return new Map([...this.objects].filter(([ id ]) => id !== -2)) as Map<number, PlayerData>;
    }

    get amhost() {
        return this.client.clientid === this.hostid;
    }

    async broadcast(messages: GameDataMessage[], reliable: boolean = true) {
        await this.client.send({
            op: reliable ? Opcode.Reliable : Opcode.Unreliable,
            payloads: [
                {
                    tag: PayloadTag.GameData,
                    code: this.code,
                    messages
                }
            ]
        });
    }

    resolvePlayer(player: PlayerDataResolvable) {
        return this.players.get(this.resolvePlayerClientID(player));
    }

    resolvePlayerClientID(player: PlayerDataResolvable) {
        if (typeof player === "number") {
            return player;
        }

        if ((player as PlayerControl).netid) {
            return (player as PlayerControl).ownerid;
        }

        return (player as PlayerData).id;
    }

    async setCode(code: string|number) {
        if (typeof code === "string") {
            return this.setCode(Code2Int(code));
        }

        this.code = code;
    }

    async setSettings(settings: Partial<GameOptions>) {
        this.settings = {
            ...this.settings,
            ...settings
        } as GameOptions;

        if (this.amhost) {
            if (this.me?.control) {
                this.me.control.syncSettings(this.settings);
            }
        }
    }

    async setHost(host: PlayerDataResolvable) {
        const resolved_id = this.resolvePlayerClientID(host);

        this.hostid = resolved_id;

        if (this.amhost) {
            if (!this.lobbybehaviour) {
                this.spawnPrefab(SpawnID.LobbyBehaviour, -2);
            }
            
            if (!this.gamedata) {
                this.spawnPrefab(SpawnID.GameData, -2);
            }
        }
    }

    async handleJoin(clientid: number) {
        if (this.objects.has(clientid))
            return;
            
        const player = new PlayerData(this, clientid);
        this.objects.set(clientid, player);
        
        this.emit("join", player);
    }

    async handleLeave(client: PlayerDataResolvable) {
        const resolved = this.resolvePlayerClientID(client);

        const player = this.players.get(resolved);

        if (!player)
            return;

        if (this.gamedata && this.gamedata.players.get(player.playerId)) {
            this.gamedata.remove(player.playerId);
        }
        
        if (this.votebansystem && this.votebansystem.clients.get(resolved)) {
            this.votebansystem.clients.delete(resolved);
        }

        for (let i = 0; i < player.components.length; i++) {
            const component = player.components[i];

            this.despawnComponent(component);
        }
        
        this.objects.delete(resolved);
    }

    beginCountdown() {
        return new Promise<void>(resolve => {
            if (this.amhost) {
                let sec = 6;
                const countdown = setInterval(() => {
                    --sec;
                    this.me.control.setStartCounter(sec);
                
                    if (sec < 1) {
                        clearInterval(countdown);
                        resolve();
                    }
                }, 1000);
            }
        });
    }



    async startGame() {
        if (this.amhost) {
            await this.client.send({
                op: Opcode.Reliable,
                payloads: [
                    {
                        tag: PayloadTag.StartGame,
                        code: this.code
                    }
                ]
            });

            await Promise.race([
                sleep(5000),
                new Promise<void>(resolve => {
                    this.on("ready", function onReady() {
                        for (const [ , player ] of this.players) {
                            if (!player.isReady)
                                return false;
                        }

                        this.off("ready", onReady);
                        resolve();
                    });
                })
            ]);

            const removes = [];
            for (const [ clientId, player ] of this.players) {
                if (!player.isReady) {
                    removes.push(clientId);
                }
            }
            
            await this.client.send({
                op: Opcode.Reliable,
                payloads: removes.map(clientId => {
                    return {
                        tag: PayloadTag.RemovePlayer,
                        code: this.code,
                        clientid: clientId,
                        reason: DisconnectReason.Error
                    }
                })
            })
        } else {
            if (this.me) await this.me.ready();

            if (this.lobbybehaviour)
                this.despawnComponent(this.lobbybehaviour);

            const ship_prefabs = [SpawnID.ShipStatus, SpawnID.Headquarters, SpawnID.PlanetMap, SpawnID.AprilShipStatus, SpawnID.Airship];
            this.spawnPrefab(ship_prefabs[this.settings?.map], -2);
        }

        this._started = true;
    }

    async handleReady(player: PlayerDataResolvable) {
        const resolved = this.resolvePlayer(player);

        await resolved.ready();
    }

    spawnComponent(component: Networkable) {
        if (this.netobjects.get(component.netid)) {
            return;
        }

        this.netobjects.set(component.netid, component);
        component.owner.components.push(component);

        this.emit("spawn", component);
    }

    private _despawnComponent(component: Networkable) {
        this.netobjects.delete(component.netid);
        component.owner.components.splice(component.owner.components.indexOf(component), 1, null);
    }

    despawnComponent(component: Networkable) {
        this._despawnComponent(component);

        this.client.stream.push({
            tag: MessageID.Despawn,
            netid: component.netid
        });
    }

    private getAvailablePlayerID() {
        for (let i = 0; i < 10; i++) {
            if (!this.getPlayerByPlayerId(i)) {
                return i;
            }
        }

        return null;
    }

    spawnPrefab(type: SpawnID, owner: Heritable|number): SpawnObject {
        if (this.amhost) {
            const ownerid = typeof owner === "number" ? owner : owner.id;
    
            const object: Partial<SpawnObject> = {
                type: SpawnID.ShipStatus,
                ownerid: ownerid,
                flags: type === SpawnID.Player ? 1 : 0,
                components: []
            };

            console.log("Spawning " + SpawnID[type] + "..");
    
            switch (type) {
            case SpawnID.ShipStatus: {
                const shipstatus = new ShipStatus(this, this.incr_netid, ownerid);
                
                this.spawnComponent(shipstatus);
    
                object.components.push(shipstatus);
                break;
            }
            case SpawnID.MeetingHud:
                const meetinghud = new MeetingHud(this, this.incr_netid, ownerid, {
                    dirtyBit: 0,
                    players: new Map
                });
                
                this.spawnComponent(meetinghud);
                
                object.components.push(meetinghud);
                break;
            case SpawnID.LobbyBehaviour:
                const lobbybehaviour = new LobbyBehaviour(this, this.incr_netid, ownerid, {
    
                });
                
                this.spawnComponent(lobbybehaviour);
    
                object.components.push(lobbybehaviour);
                break;
            case SpawnID.GameData:
                const gamedata = new GameData(this, this.incr_netid, ownerid, {
                    dirtyBit: 0,
                    players: new Map
                });
                
                this.spawnComponent(gamedata);

                const votebansystem = new VoteBanSystem(this, this.incr_netid, ownerid, {
                    clients: new Map
                });

                this.spawnComponent(votebansystem);
    
                object.components.push(gamedata);
                object.components.push(votebansystem);
                break;
            case SpawnID.Player:
                const playerId = this.getAvailablePlayerID();

                this.gamedata.add(playerId);

                const control = new PlayerControl(this, this.incr_netid, ownerid, {
                    isNew: true,
                    playerId
                });
                
                this.spawnComponent(control);
                
                const physics = new PlayerPhysics(this, this.incr_netid, ownerid, {
    
                });
                
                this.spawnComponent(physics);
                
                const transform = new CustomNetworkTransform(this, this.incr_netid, ownerid, {
                    seqId: 1,
                    position: {
                        x: 0,
                        y: 0,
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    }
                });
                
                this.spawnComponent(transform);
                
                object.components.push(control);
                object.components.push(physics);
                object.components.push(transform);
                break;
            case SpawnID.Headquarters:
                const headquarters = new Headquarters(this, this.incr_netid, ownerid);
                
                this.spawnComponent(headquarters);
    
                object.components.push(headquarters);
                break;
            case SpawnID.PlanetMap:
                const planetmap = new PlanetMap(this, this.incr_netid, ownerid);
                
                this.spawnComponent(planetmap);
    
                object.components.push(planetmap);
                break;
            case SpawnID.AprilShipStatus:
                const aprilshipstatus = new AprilShipStatus(this, this.incr_netid, ownerid);
                
                this.spawnComponent(aprilshipstatus);
    
                object.components.push(aprilshipstatus);
                break;
            case SpawnID.Airship:
                const airship = new Airship(this, this.incr_netid, ownerid);
                
                this.spawnComponent(airship);
    
                object.components.push(airship);
                break;
            }
    
            this.client.stream.push({
                tag: MessageID.Spawn,
                ownerid: object.ownerid,
                type: type,
                flags: object.flags,
                components: object.components.map(component => {
                    const data = HazelBuffer.alloc(0);
                    component.Serialize(data, true);

                    return {
                        netid: component.netid,
                        data
                    }
                })
            });

            return object as SpawnObject;
        }

        return null;
    }

    getPlayerByPlayerId(playerId: number) {
        for (const [ , player ] of this.players) {
            if (player.playerId === playerId) return player;
        }

        return null;
    }

    async handleGameData(message: GameDataMessage) {
        switch (message.tag) {
        case MessageID.Data: {
            const component = this.netobjects.get(message.netid);

            if (component) {
                component.Deserialize(message.data);
            }
            break;
        }
        case MessageID.RPC: {
            const component = this.netobjects.get(message.netid);

            if (component) {
                component.HandleRPC(message);
            }
            break;
        }
        case MessageID.Spawn: {
            for (let i = 0; i < message.components.length; i++) {
                const spawn_component = message.components[i];
                const owner = this.objects.get(message.ownerid);

                if (owner) {
                    const component = new SpawnPrefabs[message.type][i](this, spawn_component.netid, message.ownerid, spawn_component.data);

                    if (this.netobjects.get(component.netid))
                        continue;
                    
                    this.spawnComponent(component);
                }
            }
            break;
        }
        case MessageID.Despawn: {
            const component = this.netobjects.get(message.netid);
            
            if (component) {
                this._despawnComponent(component);
            }
            break;
        }
        case MessageID.SceneChange: {
            const player = this.objects.get(message.clientid) as PlayerData;

            if (player) {
                if (message.scene === "OnlineGame") {
                    player.inScene = true;

                    if (this.amhost) {
                        await this.client.send({
                            op: Opcode.Reliable,
                            payloads: [
                                {
                                    tag: PayloadTag.GameDataTo,
                                    code: this.code,
                                    recipientid: player.id,
                                    messages: [...this.netobjects.values()].reduce<SpawnMessage[]>((acc, component) => {
                                        let col = acc.find(msg => msg.type === component.type && msg.ownerid === component.ownerid);

                                        if (!col) {
                                            acc.push({
                                                tag: MessageID.Spawn,
                                                type: component.type,
                                                ownerid: component.ownerid,
                                                flags: component.classname === "PlayerControl" ? 1 : 0,
                                                components: []
                                            });
                                            
                                            col = acc.find(msg => msg.type === component.type && msg.ownerid === component.ownerid);
                                        }
                                        
                                        const data = HazelBuffer.alloc(0);
                                        component.Serialize(data, true);

                                        col.components.push({
                                            netid: component.netid,
                                            data
                                        });

                                        return acc;
                                    }, [])
                                }
                            ]
                        });

                        this.spawnPrefab(SpawnID.Player, player);

                        if (this.amhost) {
                            if (this.me) {
                                this.me.control.syncSettings(this.settings);
                            }
                        }
                    }
                }
            }
            break;
        }
        case MessageID.Ready: {
            const player = this.objects.get(message.clientid) as PlayerData;

            if (player) {
                player.isReady = true;
            }
            break;
        }
        }
    }
}