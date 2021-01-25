import { SkeldjsClient } from "@skeldjs/client";
import { Vector2 } from "@skeldjs/util";
import { MapID } from "@skeldjs/constant";

import pathfinding from "pathfinding";

import fs from "fs";
import path from "path";

import { Grid } from "./util/Grid";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export class SkeldjsPathfinder {
    private gridCache: Record<MapID, Grid>;
    private astar: pathfinding.AStarFinder;

    constructor(private client: SkeldjsClient) {
        this.gridCache = {
            [MapID.TheSkeld]: null,
            [MapID.MiraHQ]: null,
            [MapID.Polus]: null,
            [MapID.Airship]: null
        };

        this.astar = new pathfinding.AStarFinder({
            diagonalMovement: pathfinding.DiagonalMovement.Never
        });
    }

    private _getGrid(map: MapID) {
        if (this.gridCache[map]) {
            //return this.gridCache[map];
        }

        const buf = fs.readFileSync(path.resolve(__dirname, "../../data/build", ""+map));
        const grid = Grid.fromBuffer(buf);

        this.gridCache[map] = grid;

        return grid;
    }

    getPath(startx: number, starty: number, x: number, y: number, grid: Grid) {
        const start = grid.nearest(startx, starty);
        const dest = grid.nearest(x, y);

        const pfgrid = new pathfinding.Grid(grid.cells);

        const path = this.astar.findPath(start.x, start.y, dest.x, dest.y, pfgrid);

        return path// .filter((_, i) => i % grid.density === 0) // Only use coordinates on whole points
            .map(coords => {
            return {
                x: coords[0],
                y: coords[1]
            };
        });
    }

    async moveTo(position: Vector2) {
        let curpos = this.client?.room?.me?.transform?.position;
        if (!curpos)
            return;

        const map = this.client.room?.settings?.map;

        if (typeof map !== "number")
            return;

        const playerSpeed = this.client.room?.settings?.playerSpeed;

        if (typeof playerSpeed !== "number")
            return;

        const grid = this._getGrid(map);
        const path = this.getPath(curpos.x, curpos.y, position.x, position.y, grid);

        for (let i = 0; i < path.length; i++) {
            const point = grid.actual(path[i].x, path[i].y);
            const dist = Math.hypot(point.x - curpos.x, point.y - curpos.y);
            const speed = playerSpeed * SkeldjsPathfinder.speedMultiplier;

            this.client.room.me.transform.move(point);

            await sleep(dist / speed * 10);

            curpos = {
                x: point.x,
                y: point.y
            };
        }
    }

    static speedMultiplier = 1 / 50; // fixed update rate
}
