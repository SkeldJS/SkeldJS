export type EventContext = {
    cancelled: boolean;
    cancel: () => void;
};

type EventData = Record<string, any>;

type Listener<Events extends EventData, EventName extends keyof Events> = (
    ev: EventContext,
    data: Events[EventName]
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
            const ctx: EventContext = {
                cancelled: false,
                cancel() {
                    this.cancelled = true;
                },
            };

            for (const listener of listeners) {
                await listener(ctx, data);
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
        const removeListener = this.on(event, async (ev, data) => {
            removeListener();
            await listener(ev, data);
        });
        return removeListener;
    }

    wait<EventName extends keyof Events>(
        event: EventName
    ): Promise<[EventContext, Events[EventName]]> {
        return new Promise((resolve) => {
            const removeListener = this.on(event, async (ev, data) => {
                removeListener();
                resolve([ev, data]);
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

    protected removeListeners<EventName extends keyof Events>(
        event: EventName
    ) {
        const listeners = this.listeners.get(event);
        listeners.clear();
    }

    protected removeAllListeners() {
        this.listeners.clear();
    }
}
