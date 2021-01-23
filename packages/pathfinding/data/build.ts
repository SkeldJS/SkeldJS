import { Vector2 } from "@skeldjs/util";

import fs from "fs/promises";
import path from "path";

type Grid = boolean[][];

function create_buffer(x: number, y: number, width: number, height: number, density: number, grid: Grid) {
    const actual_width = width * density;
    const actual_height = height * density;
    const buf = Buffer.alloc(9 + (actual_width * actual_height) / 8);

    buf.writeInt16LE(x, 0);
    buf.writeInt16LE(y, 2);
    buf.writeInt16LE(width, 4);
    buf.writeInt16LE(height, 6);
    buf.writeUInt8(density, 8);

    let i = 0;
    let byte = 0;
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            if (i % 8 === 0) {
                buf.writeUInt8(byte, 9 + (i / 8));
                byte = 0;
            } else {
                byte |= grid[x][y] ? (1 << i % 8) : 0
            }
            i++;
        }
    }

    return buf;
}

function generate_grid(width: number, height: number, density: number) {
    const actual_width = width * density;
    const actual_height = height * density;

    return new Array(actual_width).fill(0).map(() => new Array(actual_height).fill(0).map(() => false));
}

(async () => {
    const basex = -40;
    const basey = -40;
    const width = 80;
    const height = 80;
    const density = 32;
    const lnstep = density ** 2;

    const files = await fs.readdir(path.resolve(__dirname, "./colliders"));

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = path.resolve(__dirname, "./colliders", file);

        const data = await fs.readFile(filename, "utf8");
        const grid = generate_grid(width, height, density);

        const lines = data.split("\r\n").map(line => {
            const points = line.match(/\(-?\d+\.\d+, ?-?\d+\.\d+\)/g);

            return points.map(point => {
                const numbers = point.match(/-?\d+\.\d+/g);
                const x = parseFloat(numbers[0]);
                const y = parseFloat(numbers[1]);

                return { x, y };
            })
        }) as Vector2[][];

        for (let i = 0; i < lines.length; i++) {
            const points = lines[i];
            const num_points = points.length;

            for (let i = 0; i < num_points - 1; i++) {
                const ax = points[i].x;
                const ay = points[i].y;
                const bx = points[i + 1].x;
                const by = points[i + 1].y;
                const stepx = (bx - ax) / lnstep;
                const stepy = (by - ay) / lnstep;

                for (let adv = 0; adv < lnstep; adv++) {
                    const curposx = ax + (stepx * adv);
                    const curposy = ay + (stepy * adv);

                    const rndx = Math.floor((curposx - basex) * density);
                    const rndy = Math.floor((curposy - basex) * density);

                    grid[rndx][rndy] = true;
                }
            }
        }

        process.stdout.write("\n");

        const buf = create_buffer(basex, basey, width, height, density, grid);
        await fs.writeFile(path.resolve(__dirname, "build", path.basename(file, ".txt") + ".grid"), buf);
    }
})();
