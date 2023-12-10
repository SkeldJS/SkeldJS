import fs from "fs";
import path from "path";

import { Vector2 } from "@skeldjs/util";

import { SkeldjsClient } from "@skeldjs/client";

import {
    CustomNetworkTransform,
    PlayerData,
    PlayerDataResolvable,
    PlayerLeaveEvent,
    PlayerMoveEvent,
    GameMap,
    TheSkeldVents,
    MiraHQVents,
    PolusVents,
    AirshipVents
} from "@skeldjs/core";

import { EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { PathfinderConfig } from "./interface/PathfinderConfig";
import { Grid } from "./util/Grid";
import { Node } from "./util/Node";

import { getShortestPath } from "./engine";

import {
    PathfinderEndEvent,
    EngineMoveEvent,
    PathfinderPauseEvent,
    EngineRecalculateEvent,
    PathfinderStartEvent,
    PathfinderStopEvent
} from "./events";

export type SkeldjsPathfinderEvents = ExtractEventTypes<
    [
        PathfinderEndEvent,
        EngineMoveEvent,
        PathfinderPauseEvent,
        EngineRecalculateEvent,
        PathfinderStartEvent,
        PathfinderStopEvent
    ]
>;

/**
 * Represents a pathfinding utility for the {@link SkeldjsClient SkeldJS Client}.
 *
 * See {@link SkeldjsPathfinderEvents} for events to listen to.
 */
export class SkeldjsPathfinder extends EventEmitter<SkeldjsPathfinderEvents> {
    private _tick: number;
    private _moved: boolean;

    isPaused: boolean;

    /**
     * The destination of the pathfinder.
     */
    destination?: Vector2;

    /**
     * The grid of nodes for the pathfinder engine.
     */
    grid?: Grid;

    /**
     * The current intended path of the pathfinder.
     */
    path?: Node[];

    /**
     * The player that the pathfinder is currently finding.
     */
    following?: PlayerData;

    constructor(
        private client: SkeldjsClient,
        public config: PathfinderConfig = {}
    ) {
        super();

        this._tick = 0;
        this._moved = false;
        this.isPaused = false;

        this.client.on("room.fixedupdate", this._ontick.bind(this));
        this.client.on("player.move", this._handleMove.bind(this));
        this.client.on("player.leave", this._handleLeave.bind(this));

        this.client.on("room.gameend", () => {
            this.grid = undefined;
        });

        this.client.on("player.syncsettings", () => {
            this.grid = undefined;
        });
    }

    private get snode() {
        if (!this.position) return null;

        return this.grid?.nearest(this.position.x, this.position.y);
    }

    private get dnode() {
        if (!this.destination) return null;

        return this.grid?.nearest(this.destination.x, this.destination.y);
    }

    get position() {
        return this.transform?.position;
    }

    get transform(): CustomNetworkTransform<SkeldjsClient>|undefined {
        return this.myPlayer?.transform;
    }

    get myPlayer() {
        return this.client.myPlayer;
    }

    getMapId() {
        if (this.client.lobbyBehaviour) {
            return "Lobby";
        }

        return this.client.settings?.map === undefined
            ? "Lobby"
            : GameMap[this.client.settings?.map];
    }

    private getVentForMap(ventId: number) {
        if (typeof this.getMapId() === "undefined")
            return undefined;

        switch (this.getMapId()) {
            case "TheSkeld":
                return TheSkeldVents[ventId];
            case "MiraHQ":
                return MiraHQVents[ventId];
            case "Polus":
                return PolusVents[ventId];
            case "AprilFoolsTheSkeld":
                return TheSkeldVents[ventId];
            case "Airship":
                return AirshipVents[ventId];
            default:
                return undefined;
        }
    }

    private async _ontick() {
        this._tick++;

        if (this._tick % SkeldjsPathfinder.MovementInterval !== 0)
            return;

        if (typeof this.getMapId() === "undefined")
            return;

        if (!this.grid) {
            const buff = fs.readFileSync(
                path.resolve(__dirname,
                    __filename.endsWith(".ts")
                        ? "../data/build"
                        : "../../data/build"
                    , this.getMapId())
            );
            this.grid = Grid.fromBuffer(buff);
        }

        if (!this.snode || !this.dnode)
            return;

        if (
            this._moved ||
            !this.path ||
            this._tick % (this.config.recalculateEvery || 1) === 0
        ) {
            await this.recalculate();
            this._moved = false;
        }

        if (this.isPaused) return;

        const next = this.path?.shift();
        if (next) {
            const pos = this.grid.actual(next.x, next.y);
            const dist = this.position ? Vector2.dist(this.position, pos) : 0;
            const ev = await this.emit(new EngineMoveEvent(pos));
            if (!ev.canceled) {
                this.transform?.move(
                    pos.x,
                    pos.y,
                    new Vector2(dist * this.client.settings.playerSpeed)
                );
            }

            if (this.path?.length === 0) {
                this._stop(true);
            }
        } else {
            this.destination = undefined;
            this.path = undefined;
        }
    }

    async recalculate() {
        if (!this.grid || !this.snode || !this.dnode)
            return;

        this.grid.reset();
        this.path = getShortestPath(this.grid, this.snode, this.dnode);
        this.path = this.path.filter((_node, i, arr) => i === 0 || i === arr.length - 1 || i % 3 === 0);
        await this.emit(
            new EngineRecalculateEvent(
                this.path.map((node) => this.grid!.actual(node.x, node.y))
            )
        );
    }

    pause() {
        this.isPaused = true;
        this.emitSync(new PathfinderPauseEvent);
    }

    start() {
        if (!this.destination)
            return;

        this.isPaused = false;
        this.emitSync(new PathfinderStartEvent(this.destination));
    }

    private _stop(reached: boolean) {
        this.destination = undefined;
        if (!reached) this._moved = true;

        this.emitSync(new PathfinderStopEvent(reached));
        if (reached) {
            this.emitSync(new PathfinderEndEvent);
        }
    }

    stop() {
        this._stop(false);
    }

    private _go(dest: Vector2) {
        this.destination = new Vector2(dest);
        this._moved = true;
        this.start();
    }

    go(pos: PlayerDataResolvable | Vector2 | Node): void {
        const vec = pos as Vector2;

        if (vec.x) {
            this._go(vec);
            return;
        }

        if (pos instanceof Node) {
            if (!this.grid) {
                return;
            }

            this.grid.actual(pos.x, pos.y);
            return;
        }

        const resolved = this.client.resolvePlayer(pos as PlayerDataResolvable);

        if (resolved && resolved.hasSpawned) {
            const position = resolved.transform?.position;

            if (!position) {
                throw new Error("Could not follow player: they not fully spawned.");
            }

            return this.go(position);
        }
    }

    vent(ventId: number) {
        const coords = this.getVentForMap(ventId);

        if (!coords)
            return;

        this.go(new Vector2(coords.position));
    }

    private _handleMove(ev: PlayerMoveEvent) {
        if (ev.player === this.following) {
            this.destination = new Vector2(ev.position);
            this._moved = true;
        }
    }

    private _handleLeave(ev: PlayerLeaveEvent) {
        if (ev.player === this.following) {
            this._stop(false);
            this.following = undefined;
        }
    }

    follow(player: PlayerDataResolvable) {
        const resolved = this.client.resolvePlayer(player);

        if (resolved && resolved.hasSpawned) {
            this.following = resolved;
        }
    }

    static MovementInterval = 6 as const;
}
