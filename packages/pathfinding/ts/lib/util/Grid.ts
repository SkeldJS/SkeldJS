import { HazelBuffer, Vector2 } from "@skeldjs/util";

export class Grid {
    cells: number[][];

    static fromBuffer(buffer: Buffer) {
        const reader = new HazelBuffer(buffer);

        const basex = reader.int16();
        const basey = reader.int16();
        const width = reader.int16();
        const height = reader.int16();
        const density = reader.uint8();

        const actual_width = width * density;
        const actual_height = height * density;

        const cells = new Array(actual_height).fill(null).map(() => new Array(actual_width).fill(0));

        let j = 0;
        let bit = reader.uint8();
        while (reader.left) {
            const num = reader.upacked();
            for (let i = 0; i < num; i++) {
                const y = ~~(j / actual_width);
                const x = j % actual_width;

                cells[y][x] = bit;
                j++;
            }
            bit = 1 - bit;
        }

        return new Grid(cells, basex, basey, width, height, density);
    }

    static create(basex: number, basey: number, width: number, height: number, density: number) {
        const actual_width = width * density;
        const actual_height = height * density;

        return new Grid(new Array(actual_height).fill(null).map(() => new Array(actual_width).fill(0)), basex, basey, width, height, density);
    }

    constructor(cells: number[][], readonly basex: number, readonly basey: number, readonly width: number, readonly height: number, readonly density: number) {
        this.cells = cells;
    }

    get actual_width() {
        return this.width * this.density;
    }

    get actual_height() {
        return this.height * this.density;
    }

    createBuffer() {
        const actual_width = this.width * this.density;
        const actual_height = this.height * this.density;
        const writer = HazelBuffer.alloc(actual_width * actual_height);

        writer.int16(this.basex)
            .int16(this.basey)
            .int16(this.width)
            .int16(this.height)
            .uint8(this.density);

        writer.uint8(this.cells[0][0]);

        let j = 1;
        let bit = this.cells[0][0];
        for (let x = 0; x < this.cells.length; x++) {
            for (let y = 0; y < this.cells.length; y++) {
                const cell = this.cells[x][y];

                if (cell !== bit) {
                    writer.upacked(j);
                    bit = cell;
                    j = 0;
                }
                j++;
            }
        }

        writer.realloc(writer.cursor);

        return writer.buffer;
    }

    nearest(x: number, y: number): Vector2 {
        return {
            x: ~~((x - this.basex) * this.density),
            y: ~~((y - this.basex) * this.density)
        };
    }

    actual(x: number, y: number) {
        return {
            x: (x / this.density) + this.basex,
            y: (y / this.density) + this.basey
        };
    }

    at(i: number) {
        const x = ~~(i / this.actual_width);
        const y = i % this.actual_width;

        return this.get(x, y);
    }

    get(x: number, y: number) {
        return this.cells[y][x];
    }

    set(x: number, y: number) {
        this.cells[y][x] = 1;
    }

    unset(x: number, y: number) {
        this.cells[y][x] = 0;
    }
}
