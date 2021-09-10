import { Vector2 } from "@skeldjs/util";

import fs from "fs/promises";
import path from "path";
import readline from "readline";

import { Grid } from "./lib/util/Grid";
import { Node } from "./lib/util/Node";

function gradientSetGridPointImpl(
    grid: Grid,
    original: Node,
    dropoff: number,
    radius: number
) {
    if (!original.blocked) return;

    (function recursiveSetNeighbors(
        node: Node,
        amount: number,
        radius: number
    ) {
        for (const neighbor of node.getNeighbors()) {
            if (!neighbor.blocked) {
                if (amount > neighbor.weight)
                    neighbor.weight = amount;
            }

            if (radius > 1) {
                if (neighbor.y > original.y) {
                    recursiveSetNeighbors(
                        neighbor,
                        amount - dropoff,
                        radius - 0.4
                    );
                } else {
                    recursiveSetNeighbors(
                        neighbor,
                        amount - dropoff,
                        radius - 1
                    );
                }
            }
        }
    })(original, radius, radius);
}

function gradientSetGridPoint(
    grid: Grid,
    x: number,
    y: number,
    dropoff: number,
    radius: number
) {
    const node = grid.get(x, y);

    if (node) {
        node.blocked = true;
        gradientSetGridPointImpl(grid, node, dropoff, radius);
    }
}

function get_pathname() {
    if (process.argv[0].includes("ts-node")) {
        return path.resolve(__dirname, "./data/colliders");
    } else {
        return path.resolve(__dirname, "../data/colliders");
    }
}

(async () => {
    const basex = -50;
    const basey = -50;
    const width = 100;
    const height = 100;
    const density = 16;
    const gradientDropoff = 0;
    const wallGradientWeight = 2;

    const pathname = get_pathname();

    try {
        await fs.mkdir(path.resolve(get_pathname(), "../build"));
    } catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }
    const files = await fs.readdir(pathname);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = path.resolve(pathname, file);

        console.log("reading %s..", file);
        const data = await fs.readFile(filename, "utf8");
        console.log("creating grid..");
        const grid = Grid.create(basex, basey, width, height, density);

        const started = Date.now();
        console.log("Compiling " + file + "..");

        try {
            const colliders = JSON.parse(data) as Vector2[][];

            const total_lines = colliders.reduce(
                (cur, ln) => cur + (ln.length - 1),
                0
            );
            const mil = ~~(total_lines / 100);

            console.log(
                "Compiling " +
                    total_lines +
                    " line" +
                    (total_lines === 1 ? "" : "s")
            );

            let j = 0;
            for (let i = 0; i < colliders.length; i++) {
                const points = colliders[i];
                const num_lines = points.length - 1;

                process.stdout.write("0%");

                for (let i = 0; i < num_lines; i++) {
                    // http://eugen.dedu.free.fr/projects/bresenham/

                    const c = grid.nearest(points[i].x, points[i].y);
                    const lc = grid.nearest(points[i + 1].x, points[i + 1].y);

                    let x = c.x;
                    let y = c.y;

                    let error;
                    let errorprev;

                    let dx = lc.x - c.x;
                    let dy = lc.y - c.y;

                    let xstep = 1;
                    let ystep = 1;

                    if (dy < 0) {
                        ystep = -1;
                        dy = -dy;
                    }

                    if (dx < 0) {
                        xstep = -1;
                        dx = -dx;
                    }

                    const ddx = dx * 2;
                    const ddy = dy * 2;

                    grid.set(c.x, c.y);

                    if (ddx >= ddy) {
                        errorprev = error = dx;
                        for (let i = 0; i < dx; i++) {
                            x += xstep;
                            error += ddy;
                            if (error > ddx) {
                                y += ystep;
                                error -= ddx;
                                if (error + errorprev < ddx) {
                                    gradientSetGridPoint(
                                        grid,
                                        x,
                                        y - ystep,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                } else if (error + errorprev > ddx) {
                                    gradientSetGridPoint(
                                        grid,
                                        x - xstep,
                                        y,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                } else {
                                    gradientSetGridPoint(
                                        grid,
                                        x,
                                        y - ystep,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                    gradientSetGridPoint(
                                        grid,
                                        x - xstep,
                                        y,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                }
                            }
                            gradientSetGridPoint(
                                grid,
                                x,
                                y,
                                gradientDropoff,
                                wallGradientWeight
                            );
                            errorprev = error;
                        }
                    } else {
                        errorprev = error = dy;
                        for (let i = 0; i < dy; i++) {
                            y += ystep;
                            error += ddx;
                            if (error > ddy) {
                                x += xstep;
                                error -= ddy;
                                if (error + errorprev < ddy) {
                                    gradientSetGridPoint(
                                        grid,
                                        x - xstep,
                                        y,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                } else if (error + errorprev > ddy) {
                                    gradientSetGridPoint(
                                        grid,
                                        x,
                                        y - ystep,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                } else {
                                    gradientSetGridPoint(
                                        grid,
                                        x,
                                        y - ystep,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                    gradientSetGridPoint(
                                        grid,
                                        x - xstep,
                                        y,
                                        gradientDropoff,
                                        wallGradientWeight
                                    );
                                }
                            }
                            gradientSetGridPoint(
                                grid,
                                x,
                                y,
                                gradientDropoff,
                                wallGradientWeight
                            );
                            errorprev = error;
                        }
                    }

                    j++;
                    if (j % mil === 0) {
                        readline.cursorTo(process.stdout, 0);
                        readline.clearLine(process.stdout, 0);
                        process.stdout.write(
                            ((j / total_lines) * 100).toFixed(1) + "%"
                        );
                    }
                }
            }

            const took = Date.now() - started;
            const buf = grid.createBuffer();

            process.stdout.write("\n");
            console.log(".." + took + "ms");
            console.log(
                ".." + (buf.byteLength / 1024).toFixed(3) + "kb written"
            );

            await fs.writeFile(
                path.resolve(
                    pathname,
                    "../build",
                    path.basename(file, ".json")
                ),
                buf
            );
        } catch (e) {
            readline.cursorTo(process.stdout, 0);
            console.log("..There was an error parsing " + file);
            console.log(e);
            continue;
        }
    }
})();
