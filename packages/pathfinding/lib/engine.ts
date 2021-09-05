import Heap from "heap";

import { Grid } from "./util/Grid";
import { Node } from "./util/Node";

const heuristic = (a: number, b: number) => Math.hypot(a, b);

export function getShortestPath(grid: Grid, start: Node, end: Node) {
    const heap = new Heap((a: Node, b: Node) => {
        return a.f - b.f;
    });

    start.g = 0;
    start.h = heuristic(start.x - end.x, start.y - end.y);
    start.parent = undefined;

    heap.push(start);

    grid.pathid++;

    start.opened = false;

    let closest: Node = start;

    while (heap.size() > 0) {
        const current = heap.pop() as Node;

        current.closed = true;
        grid.dirty.add(current);

        if (!closest?.h || !current.h || current.h < closest.h) {
            closest = current;
        }

        if (current === end) {
            const path = current.getPath();
            path.shift();
            return path;
        }

        const neighbors = current.getNeighbors().filter(node => !node.blocked);
        for (const neighbor of neighbors) {
            if (neighbor.closed)
                continue;

            const g =
                (current.g! +
                    (neighbor.x - current.x === 0 ||
                    neighbor.y - current.y === 0
                        ? 1
                        : Math.SQRT2)) *
                neighbor.weight;

            if (!neighbor.closed || g < neighbor.g!) {
                neighbor.g = g;
                neighbor.h ||=
                    1 * heuristic(neighbor.x - end.x, neighbor.y - end.y);
                neighbor.parent = current;

                if (!neighbor.opened) {
                    heap.push(neighbor);
                    neighbor.opened = true;
                    grid.dirty.add(neighbor);
                } else {
                    heap.updateItem(neighbor);
                }
            }
        }
    }

    if (closest) {
        const path = closest.getPath();
        path.shift();
        return path;
    }

    return [];
}
