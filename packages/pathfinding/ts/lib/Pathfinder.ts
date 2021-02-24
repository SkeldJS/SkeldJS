import { SkeldjsClient } from "@skeldjs/client";
import { Vector2 } from "@skeldjs/util";

import {
    CustomNetworkTransform,
    PlayerData,
    PlayerDataResolvable,
    TheSkeldVent,
    MiraHQVent,
    PolusVent,
    MapVentData
} from "@skeldjs/core";

import Emittery from "emittery";

import fs from "fs";
import path from "path";

import { PathfinderConfig } from "./interface/PathfinderConfig";
import { Grid } from "./util/Grid";
import { Node } from "./util/Node";

import { getShortestPath } from "./engine";

type SkeldjsPathfinderEvents = {
    "pathfinding.start": {
        destination: Vector2;
    };
    "pathfinding.stop": {
        reached: boolean;
    };
    "pathfinding.pause": {};
    "engine.recalculate": {
        path: Vector2[];
    };
}

export class SkeldjsPathfinder extends Emittery<SkeldjsPathfinderEvents> {
    private _tick: number;
    private _moved: boolean;
    private _paused: boolean;
    destination: Vector2;
    grid: Grid;
    path: Node[];
    following: PlayerData;

    constructor(private client: SkeldjsClient, public config: PathfinderConfig = {}) {
        super();

        this.client.on("client.fixedupdate", this._ontick.bind(this));
        this.client.on("player.move", this._handleMove.bind(this));
        this.client.on("player.leave", this._handleLeave.bind(this));
    }

    private get snode() {
        if (!this.position)
            return null;

        return this.grid.nearest(this.position.x, this.position.y);
    }

    private get dnode() {
        if (!this.destination)
            return null;

        return this.grid.nearest(this.destination.x, this.destination.y);
    }

    get position() {
        return this.transform?.position;
    }

    get transform(): CustomNetworkTransform {
        return this.me?.transform;
    }

    get me() {
        return this.room?.me;
    }

    get room() {
        return this.client?.room;
    }

    get map() {
        return this.room?.settings?.map;
    }

    get paused() {
        return this._paused;
    }

    private _ontick() {
        this._tick++;

        if (typeof this.map === "undefined")
            return;

        if (!this.grid) {
            const buff = fs.readFileSync(path.resolve(__dirname, "../../data/build", ""+this.map));
            this.grid = Grid.fromBuffer(buff);
        }

        if (!this.snode || !this.dnode)
            return;

        if (this._moved || !this.path || this._tick % (this.config.recalculateEvery || 1) === 0) {
            this.recalculate();
            this._moved = false;
            this.emit("engine.recalculate", {
                path: this.path.map(node => this.grid.actual(node.x, node.y))
            });
        }

        if (this._paused)
            return;

        const next = this.path.shift();

        if (next) {
            const pos = this.grid.actual(next.x, next.y);
            this.transform.move(pos);

            if (this.path.length === 0) {
                this._stop(true);
            }
        } else {
            this.destination = null;
            this.path = null;
        }
    }

    recalculate() {
        this.grid.reset();
        this.path = getShortestPath(this.grid, this.snode, this.dnode);
    }

    pause() {
        this._paused = true;
        this.emit("pathfinding.pause", {});
    }

    start() {
        this._paused = false;
        this.emit("pathfinding.start", {
            destination: this.destination
        });
    }

    private _stop(reached: boolean) {
        this.destination = null;
        if (!reached) this._moved = true;

        this.emit("pathfinding.stop", { reached });
    }

    stop() {
        this._stop(false);
    }

    private _go(dest: Vector2) {
        this.destination =  { // Recreate object to not recalculate new player position after moving.
            x: dest.x,
            y: dest.y
        };
        this._moved = true;
        this.start();
    }

    go(pos: PlayerDataResolvable|Vector2|Node) {
        const vec = pos as Vector2;

        if (vec.x) {
            this._go(vec);
            return;
        }

        if (pos instanceof Node) {
            return this.grid.actual(pos.x, pos.y)
        }

        const resolved = this.client?.room?.resolvePlayer(pos as PlayerDataResolvable);

        if (resolved && resolved.spawned) {
            const position = resolved.transform.position;

            return this.go(position);
        }
    }

    vent(ventid: TheSkeldVent|MiraHQVent|PolusVent) {
        if (!this.map)
            return;

        const coords = MapVentData[this.map][ventid];

        this.go(coords.position);
    }

    private _handleMove({ component, position }: { component: CustomNetworkTransform, position: Vector2 }) {
        if (component.owner === this.following) {
            this.destination = {
                x: position.x,
                y: position.y
            };
            this._moved = true;
        }
    }

    private _handleLeave({ player }: { player: PlayerData }) {
        if (player === this.following) {
            this._stop(false);
            this.following = null;
        }
    }

    follow(player: PlayerDataResolvable) {
        const resolved = this.client?.room?.resolvePlayer(player);

        if (resolved && resolved.spawned) {
            this.following = resolved;
        }
    }

    static FixedUpdateInterval = 25 as const;
}
