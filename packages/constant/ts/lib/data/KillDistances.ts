import { DistanceID } from "../enum/DistanceID"

export const KillDistances = {
    [DistanceID.Short]: 1.0,
    [DistanceID.Medium]: 1.8,
    [DistanceID.Long]: 2.5
} as const;