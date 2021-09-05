import { Grid } from "./Grid";

export class Node {
    g?: number;
    h?: number;
    parent?: Node;
    opened: boolean;
    closed: boolean;

    x: number;
    y: number;
    blocked: boolean;
    weight: number;

    constructor(
        private _grid: Grid,
        x: number,
        y: number,
        blocked: boolean,
        weight: number = 1
    ) {
        this.x = x;
        this.y = y;
        this.blocked = blocked;
        this.weight = weight;
        this.opened = false;
        this.closed = false;
    }

    get f() {
        return this.g && this.h ? this.g + this.h : 0;
    }

    get grid() {
        return this._grid;
    }

    set grid(grid: Grid) {
        this._grid = grid;
    }

    get actual() {
        return this.grid.actual(this.x, this.y);
    }

    getPath(): Node[] {
        const path: Node[] = [this];

        if (!this.parent) return path;

        return [...this.parent.getPath(), ...path];
    }

    getAdjacent() {
        const adjacent: Node[] = [];

        if (this.grid.get(this.x - 1, this.y)) {
            adjacent.push(this.grid.get(this.x - 1, this.y));
        }

        if (this.grid.get(this.x, this.y - 1)) {
            adjacent.push(this.grid.get(this.x, this.y - 1));
        }

        if (this.grid.get(this.x + 1, this.y)) {
            adjacent.push(this.grid.get(this.x + 1, this.y));
        }

        if (this.grid.get(this.x, this.y + 1)) {
            adjacent.push(this.grid.get(this.x, this.y + 1));
        }

        return adjacent;
    }

    getNeighbors() {
        const neighbors = this.getAdjacent();

        if (this.grid.get(this.x - 1, this.y - 1)) {
            neighbors.push(this.grid.get(this.x - 1, this.y - 1));
        }

        if (this.grid.get(this.x - 1, this.y + 1)) {
            neighbors.push(this.grid.get(this.x - 1, this.y + 1));
        }

        if (this.grid.get(this.x + 1, this.y + 1)) {
            neighbors.push(this.grid.get(this.x + 1, this.y + 1));
        }

        if (this.grid.get(this.x + 1, this.y - 1)) {
            neighbors.push(this.grid.get(this.x + 1, this.y - 1));
        }

        return neighbors;
    }

    isWithin(node: Node, radius: number) {
        return (
            this.x >= node.x - radius &&
            this.x <= node.x + radius &&
            this.y >= node.y - radius &&
            this.y <= node.y + radius
        );
    }
}
