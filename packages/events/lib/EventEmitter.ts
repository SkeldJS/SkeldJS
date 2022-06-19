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
    EventName extends ExtractEventName<Events[number]>
> = Extract<Events[number], { eventName: EventName }>;

export type ExtractEventTypes<Events extends Eventable[]> = {
    [K in ExtractEventName<Events[number]>]: ExtractEventType<Events, K>;
};

export type EventData = Record<string | number | symbol, Eventable>;

type Listener<Event extends Eventable> = (ev: Event) => void | Promise<void>;

export class EventEmitter<Events extends EventData> {
    private readonly listeners: Map<
        string,
        Listener<any>[]
    >;

    constructor() {
        this.listeners = new Map;
    }

    async emit<Event extends BasicEvent>(
        event: Event
    ): Promise<Event> {
        const listeners = this.getListeners<Event>(event.eventName);

        const promises = [];
        for (let i = 0; i < listeners.length; i++) {
            promises.push(listeners[i](event));
        }
        await Promise.all(promises);

        return event;
    }

    async emitSerial<Event extends BasicEvent>(
        event: Event
    ): Promise<Event> {
        const listeners = this.getListeners<Event>(event.eventName);

        for (let i = 0; i < listeners.length; i++) {
            await listeners[i](event);
        }

        return event;
    }

    emitSync<Event extends BasicEvent>(
        event: Event
    ): Event {
        const listeners = this.getListeners<Event>(event.eventName);

        for (let i = 0; i < listeners.length; i++) {
            listeners[i](event);
        }

        return event;
    }

    on<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events[EventName]>
    ): () => void;
    on<K extends BasicEvent>(event: string, listener: Listener<K>): () => void;
    on(event: string, listener: Listener<any>): () => void {
        const listeners = this.getListeners(event);
        listeners.push(listener);

        return this.off.bind(this, event, listener);
    }

    once<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events[EventName]>
    ): () => void;
    once<K extends BasicEvent>(event: string, listener: Listener<K>): () => void;
    once(event: string, listener: Listener<any>): () => void {
        const removeListener = this.on(event, async (ev) => {
            removeListener();
            await listener(ev);
        });
        return removeListener;
    }

    wait<EventName extends keyof Events>(
        event: EventName
    ): Promise<Events[EventName]>;
    wait(event: string): Promise<BasicEvent>;
    wait(event: string): Promise<BasicEvent> {
        return new Promise((resolve) => {
            this.once(event, resolve);
        });
    }

    waitf<EventName extends keyof Events>(
        event: EventName,
        filter: (ev: Events[EventName]) => boolean|Promise<boolean>
    ): Promise<Events[EventName]>;
    waitf<K extends BasicEvent>(event: string, filter: (ev: K) => boolean|Promise<boolean>): Promise<BasicEvent>;
    waitf(event: string, filter: (ev: any) => boolean|Promise<boolean>): Promise<BasicEvent> {
        return new Promise(resolve => {
            const off = this.on(event, async ev => {
                if (await filter(ev)) {
                    off();
                    resolve(ev);
                }
            });
        });
    }

    off<EventName extends keyof Events>(
        event: EventName,
        listener: Listener<Events[EventName]>
    ): void;
    off<K extends BasicEvent>(event: string, listener: Listener<K>): void;
    off(event: string, listener: Listener<any>) {
        const listeners = this.getListeners(event);
        const idx = listeners.indexOf(listener);
        if (idx > -1) {
            listeners.splice(idx, 1);
        }
    }

    getListeners<Event extends BasicEvent = BasicEvent>(event: string): Listener<Event>[] {
        const cachedListeners = this.listeners.get(event);
        const listeners = cachedListeners || [];
        if (!cachedListeners) {
            this.listeners.set(event, listeners);
        }
        return listeners;
    }

    removeListeners(event: string) {
        const listeners = this.getListeners(event);
        listeners.splice(0);
    }

    removeAllListeners() {
        for (const [eventName] of this.listeners) {
            this.removeListeners(eventName);
        }
    }
}
