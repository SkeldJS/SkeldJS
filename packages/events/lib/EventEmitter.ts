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
    EventName extends ExtractEventName<Events[number]>
> = Extract<Events[number], { eventName: EventName }>;

export type ExtractEventTypes<Events extends Eventable[]> = {
    [K in ExtractEventName<Events[number]>]: ExtractEventType<Events, K>
};

export type EventData = Record<string|number|symbol, Eventable>;

type Listener<
    Event extends Eventable
> = (ev: Event) => void | Promise<void>;

export class EventEmitter<Events extends EventData> {
    private readonly listeners: Map<
        keyof Events,
        Set<Listener<Events[keyof Events]>>
    >;

    constructor() {
        this.listeners = new Map();
    }

    async emit<Event extends Events[keyof Events]>(
        event: Event
    ) {
        const listeners = this.getListeners(event.eventName) as Set<Listener<Event>>;

        if (listeners.size) {
            for (const listener of listeners) await listener(event);
        }

        return event;
    }

    on<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events[EventName]>
    ): () => void {
        const listeners = this.getListeners(event);
        listeners.add(listener);

        return this.off.bind(this, event, listener);
    }

    once<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events[EventName]>
    ) {
        const removeListener = this.on(event, async (ev) => {
            removeListener();
            await listener(ev);
        });
        return removeListener;
    }

    wait<EventName extends keyof Events>(
        event: EventName
    ): Promise<Events[EventName]> {
        return new Promise((resolve) => {
            this.once(event, async (ev) => {
                resolve(ev);
            });
        });
    }

    off<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events[EventName]>
    ) {
        const listeners = this.getListeners(event);
        listeners.delete(listener);
    }

    getListeners<EventName extends keyof Events>(
        event: EventName
    ): Set<Listener<Events[EventName]>> {
        const listeners = this.listeners.get(event);
        if (!listeners) {
            this.listeners.set(event, new Set());
            return this.getListeners(event);
        }
        return listeners as Set<Listener<Events[EventName]>>;
    }

    removeListeners<EventName extends keyof Events>(
        event: EventName
    ) {
        const listeners = this.getListeners(event);
        listeners.clear();
    }

    removeAllListeners() {
        for (const [eventName] of this.listeners) {
            this.removeListeners(eventName);
        }
    }
}
