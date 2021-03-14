export enum DebugLevel {
    None = 0,
    Everything = 1,
    Outbound = 2,
    Inbound = 4,
    Packets = DebugLevel.Outbound | DebugLevel.Inbound,
    Spawn = 8,
    Despawn = 16,
    Data = 32,
    Objects = DebugLevel.Spawn | DebugLevel.Despawn | DebugLevel.Data,
}

export interface ClientConfig {
    debug?: DebugLevel;
    /**
     * Whether or not to allow host actions to take place.
     */
    allowHost?: boolean;
}
