export type EventContext<T> = {
    cancelled: boolean;
    cancel: () => void;
    data: T;
};

type EventData = Record<string, any>;

type Listener<Events extends EventData, EventName extends keyof Events> = (
    ev: EventContext<Events[EventName]>
) => void|Promise<void>;

export class EventEmitter<Events extends EventData> {
    private readonly listeners: Map<keyof Events, Set<Listener<Events, any>>>;

    constructor() {
        this.listeners = new Map();
    }

    async emit<EventName extends keyof Events>(
        event: EventName,
        data: Events[EventName]
    ) {
        const listeners = this.getListeners(event);

        if (listeners.size) {
            const ctx: EventContext<Events[EventName]> = {
                cancelled: false,
                cancel() {
                    this.cancelled = true;
                },
                data
            };

            for (const listener of listeners) {
                await listener(ctx);
                if (ctx.cancelled) {
                    return false;
                }
            }
        }

        return true;
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
        const removeListener = this.on(event, async ev => {
            removeListener();
            await listener(ev);
        });
        return removeListener;
    }

    wait<EventName extends keyof Events>(
        event: EventName
    ): Promise<EventContext<Events[EventName]>> {
        return new Promise((resolve) => {
            const removeListener = this.on(event, async ev => {
                removeListener();
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
        const listeners = this.getListeners(event);
        if (!listeners) {
            this.listeners.set(event, new Set());
            return this.getListeners(event);
        }
        return listeners;
    }

    removeListeners<EventName extends keyof Events>(
        event: EventName
    ) {
        const listeners = this.getListeners(event);
        listeners.clear();
    }

    removeAllListeners() {
        for (const [ eventName ] of this.listeners) {
            this.removeListeners(eventName);
        }
    }
}
