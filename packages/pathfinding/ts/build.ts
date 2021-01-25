import { Vector2 } from "@skeldjs/util";

import fs from "fs/promises";
import path from "path";
import readline from "readline";

import { Grid } from "./lib/util/Grid";

(async () => {
    const basex = -40;
    const basey = -40;
    const width = 80;
    const height = 80;
    const density = 36;

    const files = await fs.readdir(path.resolve(__dirname, "../data/colliders"));

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = path.resolve(__dirname, "../data/colliders", file);

        const data = await fs.readFile(filename, "utf8");
        const grid = Grid.create(basex, basey, width, height, density);

        const started = Date.now();
        console.log("Compiling " + file + "..");

        try {
            const lines = data.split("\r\n").map(line => {
                const points = line.match(/\(-?\d+(\.\d+)?, ?-?\d+(\.\d+)?\)/g);

                return points.map(point => {
                    const numbers = point.match(/-?\d+(\.\d+)?/g);
                    const x = parseFloat(numbers[0]) * 1.2;
                    const y = parseFloat(numbers[1]) * 1.2;

                    return { x, y };
                })
            }) as Vector2[][];

            for (let i = 0; i < lines.length; i++) {
                const points = lines[i];
                const num_points = points.length;

                for (let i = 0; i < num_points - 1; i++) {
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
                                    grid.set(x, y - ystep);
                                } else if (error + errorprev > ddx) {
                                    grid.set(x - xstep, y);
                                } else {
                                    grid.set(x, y - ystep);
                                    grid.set(x - xstep, y);
                                }
                            }
                            grid.set(x, y);
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
                                    grid.set(x - xstep, y);
                                } else if (error + errorprev > ddy) {
                                    grid.set(x, y - ystep);
                                } else {
                                    grid.set(x, y - ystep);
                                    grid.set(x - xstep, y);
                                }
                            }
                            grid.set(x, y);
                            errorprev = error;
                        }
                    }
                }
            }

            const took = Date.now() - started;
            const buf =  grid.createBuffer();

            console.log(".." + took + "ms");
            console.log(".." + (buf.byteLength / 1024).toFixed(3) + "kb written");


        await fs.writeFile(path.resolve(__dirname, "../data/build", path.basename(file, ".txt")), buf);
        } catch (e) {
            readline.cursorTo(process.stdout, 0);
            console.log("..There was an error parsing " + file);
            console.log(e.toString())
            continue;
        }
    }
})();
