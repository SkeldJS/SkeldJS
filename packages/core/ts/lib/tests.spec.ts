import { HazelBuffer } from "@skeldjs/util";
import { Networkable } from "./Networkable";

export const alphabet = "abcdefghijklmnopqrstuvwxyz";

export interface TestEvents {
    "test.event": {
        alphabet: string;
    };
}

export class TestComponent extends Networkable<{ dataParam: number }, TestEvents> {
    static classname = "TestComponent" as const;
    classname = "TestComponent" as const;

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        void spawn;
        this.dataParam = reader.uint8();
    }

    dataParam: number;
}
