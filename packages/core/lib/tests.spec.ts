import { HazelReader } from "@skeldjs/util";
import { BasicEvent, ExtractEventTypes } from "@skeldjs/events";
import { Networkable, NetworkableEvents } from "./Networkable";

export const alphabet = "abcdefghijklmnopqrstuvwxyz";

export class TestEvent extends BasicEvent {
    static eventName = "test.event" as const;
    eventName = "test.event" as const;

    alphabet: string;

    constructor(alphabet: string) {
        super();

        this.alphabet = alphabet;
    }
}

export type TestEvents = NetworkableEvents & ExtractEventTypes<[TestEvent]>;

export class TestComponent extends Networkable<
    { dataParam: number },
    TestEvents
> {
    static classname = "TestComponent" as const;
    classname = "TestComponent" as const;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Deserialize(reader: HazelReader, spawn: boolean = false) {
        this.dataParam = reader.uint8();
    }

    dataParam: number;
}
