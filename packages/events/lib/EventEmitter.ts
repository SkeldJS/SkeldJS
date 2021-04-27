import { BasicEvent } from "./BasicEvent";

export type Eventable = {
    eventName: string;
};

export type ExtractEventName<Event extends Eventable> = Event extends {
    eventName: infer X;
}
    ? X
    : never;

export type ExtractEventType<
    Events extends Eventable[],
    EventName extends keyof Events
> = Extract<Events[number], { eventName: EventName }>;

export type ExtractEventTypes<Events extends Eventable[]> = {
    [K in ExtractEventName<Events[number]>]: K extends keyof Events
        ? ExtractEventType<Events, K>
        : never;
};

type EventData = BasicEvent[];

type Listener<Events extends EventData, EventName extends keyof Events> = (
    ev: ExtractEventType<Events, EventName>
) => void | Promise<void>;

export class EventEmitter<Events extends EventData> {
    private readonly listeners: Map<keyof Events, Set<Listener<Events, any>>>;

    constructor() {
        this.listeners = new Map();
    }

    async emit<EventName extends keyof Events>(
        event: EventName,
        data: ExtractEventType<Events, EventName>
    ) {
        const listeners = this.getListeners(event);

        if (listeners.size) {
            for (const listener of listeners) await listener(data);
        }

        return data;
    }

    on<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events, EventName>
    ): () => void {
        const listeners = this.getListeners(event);
        listeners.add(listener);

        return this.off.bind(this, event, listener);
    }

    once<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events, EventName>
    ) {
        const removeListener = this.on(event, async (ev) => {
            removeListener();
            await listener(ev);
        });
        return removeListener;
    }

    wait<EventName extends keyof Events>(
        event: EventName
    ): Promise<ExtractEventType<Events, EventName>> {
        return new Promise((resolve) => {
            this.once(event, async (ev) => {
                resolve(ev);
            });
        });
    }

    off<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events, EventName>
    ) {
        const listeners = this.getListeners(event);
        listeners.delete(listener);
    }

    getListeners<EventName extends keyof Events>(
        event: EventName
    ): Set<Listener<Events, EventName>> {
        const listeners = this.listeners.get(event);
        if (!listeners) {
            this.listeners.set(event, new Set());
            return this.getListeners(event);
        }
        return listeners;
    }

    removeListeners<EventName extends keyof Events>(event: EventName) {
        const listeners = this.getListeners(event);
        listeners.clear();
    }

    removeAllListeners() {
        for (const [eventName] of this.listeners) {
            this.removeListeners(eventName);
        }
    }
}
