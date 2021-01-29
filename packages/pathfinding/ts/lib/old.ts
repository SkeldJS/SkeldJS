import { SkeldjsClient } from "@skeldjs/client";
import { TypedEmitter, Vector2 } from "@skeldjs/util";

import { Grid } from "./util/Grid";
import { getShortestPath } from "./engine";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

type PathfinderEvents = {
    start: (start: Vector2, dest: Vector2) => void;
    stop: () => void;
}

export class SkeldjsPathfinder extends TypedEmitter<PathfinderEvents> {
    grid: Grid;
    destination: Vector2;

    private moving: boolean;
    private curpos: Vector2;
    private playerSpeed

    constructor(private client: SkeldjsClient) {
        super();

        this.moving = false;

        client.on("disconnect", () => {
            this.stop();
        });

        client.on("despawn", (room, component) => {
            if (component === client.room?.me?.transform) {
                this.stop();
            }
        });
    }

    getPath(start: Vector2, dest: Vector2, grid: Grid) {
        const startnode = this.grid.nearest(start.x, start.y);
        const endnode = this.grid.nearest(dest.x, dest.y);

        const path = getShortestPath(grid, startnode, endnode);

        return path;
    }

    stop() {
        this.moving = false;
    }

    sleep(dist: number, speed: number) {
        return new Promise<boolean>(resolve => {
            const time = dist / speed;

            const onStop = () => {
                resolve(false);
            }

            this.once("stop", onStop);

            sleep(time).then(() => {
                this.off("stop", onStop);

                resolve(true);
            });
        });
    }

    private async start() {
        let curpos = this.client?.room?.me?.transform?.position;
        if (!curpos)
            return;

        if (typeof this.client.room?.settings?.playerSpeed !== "number")
            return;

        const path = this.getPath(curpos, this.destination, this.grid);

        for (let i = 0; i < path.length; i++) {
            this.moving = true;

            if (!this.client?.room?.me?.transform)
                break;

            const point = this.grid.actual(path[i].x, path[i].y);
            const dist = Math.hypot(point.x - curpos.x, point.y - curpos.y);
            const speed = this.client.room?.settings?.playerSpeed * SkeldjsPathfinder.speedMultiplier;

            this.client.room.me.transform.move(point);

            if (await sleep(dist / speed)) {
                curpos = {
                    x: point.x,
                    y: point.y
                };

                continue;
            }
            break;
        }
    }

    async moveTo(position: Vector2) {
        this.stop();
        this.destination = position;
        await this.start();
    }

    static speedMultiplier = 1 / 50; // fixed update rate
}
