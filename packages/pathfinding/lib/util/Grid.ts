import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";

import { Node } from "./Node";

export class Grid {
    nodes: Node[][];
    dirty: Set<Node>;
    pathid: number;

    static fromBuffer(buffer: Buffer) {
        const reader = HazelReader.from(buffer);

        const basex = reader.int16();
        const basey = reader.int16();
        const width = reader.uint16();
        const height = reader.uint16();
        const density = reader.uint8();

        const actual_width = width * density;
        const actual_height = height * density;

        const grid = new Grid(
            new Array(actual_height)
                .fill(null)
                .map(() => new Array(actual_width).fill(null)),
            basex,
            basey,
            width,
            height,
            density
        );

        let i = 0;
        while (reader.left) {
            const num = reader.upacked();
            const blocked = reader.bool();
            const weight = reader.float();

            for (let j = 0; j < num; j++) {
                const x = i % actual_height;
                const y = ~~(i / actual_height);

                if (!grid.nodes[y]) {
                    grid.nodes.push([]);
                }

                grid.nodes[y][x] = new Node(grid, x, y, blocked, weight);
                i++;
            }
        }

        return grid;
    }

    static create(
        basex: number,
        basey: number,
        width: number,
        height: number,
        density: number
    ) {
        const actual_width = width * density;
        const actual_height = height * density;

        const grid = new Grid([], basex, basey, width, height, density);

        grid.nodes = new Array(actual_height).fill(null).map((_, y) => {
            return new Array(actual_width).fill(null).map((_, x) => {
                return new Node(grid, x, y, false, 1);
            });
        });

        return grid;
    }

    constructor(
        nodes: Node[][],
        readonly basex: number,
        readonly basey: number,
        readonly width: number,
        readonly height: number,
        readonly density: number
    ) {
        this.nodes = nodes;
        this.dirty = new Set;
        this.pathid = 0;
    }

    get actual_width() {
        return this.width * this.density;
    }

    get actual_height() {
        return this.height * this.density;
    }

    nearest(x: number, y: number): Node {
        const nodex = ~~((x - this.basex) * this.density);
        const nodey = ~~((y - this.basey) * this.density);

        return this.nodes[nodey][nodex];
    }

    actual(x: number, y: number) {
        return new Vector2(
            x / this.density + this.basex,
            y / this.density + this.basey
        );
    }

    at(i: number) {
        const x = ~~(i / this.actual_height);
        const y = i % this.actual_height;

        return this.get(x, y);
    }

    get(x: number, y: number) {
        return this.nodes?.[y]?.[x];
    }

    set(x: number, y: number) {
        if (!this.get(x, y)) return;

        this.nodes[y][x].blocked = true;
    }

    unset(x: number, y: number) {
        if (!this.get(x, y)) return;

        this.nodes[y][x].blocked = false;
    }

    reset() {
        for (const node of this.dirty) {
            node.opened = false;
            node.closed = false;
            node.g = undefined;
            node.h = undefined;
        }
    }

    createBuffer() {
        const actual_width = this.width * this.density;
        const actual_height = this.height * this.density;

        const writer = HazelWriter.alloc(actual_width * actual_height);

        writer.int16(this.basex);
        writer.int16(this.basey);
        writer.uint16(this.width);
        writer.uint16(this.height);
        writer.uint8(this.density);

        let num = 0;
        let current: Node|undefined = undefined;
        for (let y = 0; y < this.actual_height; y++) {
            for (let x = 0; x < this.actual_width; x++) {
                if (!current) {
                    current = this.nodes[y][x];
                }

                if (
                    current.blocked !== this.nodes[y][x].blocked ||
                    current.weight !== this.nodes[y][x].weight
                ) {
                    writer.upacked(num);
                    writer.bool(current.blocked);
                    writer.float(current.weight);
                    current = this.nodes[y][x];
                    num = 0;
                }

                num++;
            }
        }
        writer.upacked(num);
        writer.bool(current?.blocked || false);
        writer.float(current?.weight || 0);

        writer.realloc(writer.cursor);

        return writer.buffer;
    }
}
