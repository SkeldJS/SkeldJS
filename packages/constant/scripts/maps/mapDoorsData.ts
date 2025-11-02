import { GameMap } from "../../enums";
import { SystemType } from "../SystemType";

export type DoorData = {
    associatedZone: SystemType;
    position: { x: number; y: number; };
};

export const mapDoorsData: Record<GameMap, DoorData[]> = {
    [GameMap.TheSkeld]: [
        {
            associatedZone: SystemType.Cafeteria,
            position: { x: -6.3936, y: 1.33848 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: -5.268, y: -14.2884 },    
        },
        {
            associatedZone: SystemType.UpperEngine,
            position: { x: -16.930801, y: -2.1276002 },    
        },
        {
            associatedZone: SystemType.Cafeteria,
            position: { x: -0.708, y: -4.992 },    
        },
        {
            associatedZone: SystemType.LowerEngine,
            position: { x: -14.6808, y: -11.472 },    
        },
        {
            associatedZone: SystemType.UpperEngine,
            position: { x: -14.676002, y: 1.3406401 },    
        },
        {
            associatedZone: SystemType.Security,
            position: { x: -14.734801, y: -5.1417603 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: 1.1316001, y: -11.98128 },    
        },
        {
            associatedZone: SystemType.Cafeteria,
            position: { x: 5.1432004, y: 1.3355999 },    
        },
        {
            associatedZone: SystemType.Electrical,
            position: { x: -9.53616, y: -13.416001 },    
        },
        {
            associatedZone: SystemType.MedBay,
            position: { x: -9.1452, y: -0.4439999 },    
        },
        {
            associatedZone: SystemType.LowerEngine,
            position: { x: -16.930801, y: -8.9664 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: -0.70919997, y: -8.560801 },    
        },
    ],
    [GameMap.MiraHQ]: [
    ],
    [GameMap.Polus]: [
        {
            associatedZone: SystemType.Electrical,
            position: { x: 11.255, y: -9.4473 },    
        },
        {
            associatedZone: SystemType.Electrical,
            position: { x: 7.4827003, y: -10.922001 },    
        },
        {
            associatedZone: SystemType.Electrical,
            position: { x: 5.4228, y: -13.496 },    
        },
        {
            associatedZone: SystemType.LifeSupp,
            position: { x: 5.492, y: -18.301 },    
        },
        {
            associatedZone: SystemType.LifeSupp,
            position: { x: 5.9068003, y: -22.348 },    
        },
        {
            associatedZone: SystemType.Weapons,
            position: { x: 13.0322, y: -20.701 },    
        },
        {
            associatedZone: SystemType.Comms,
            position: { x: 10.8987, y: -19.159 },    
        },
        {
            associatedZone: SystemType.Office,
            position: { x: 28.757002, y: -17.0636 },    
        },
        {
            associatedZone: SystemType.Office,
            position: { x: 17.417002, y: -21.7231 },    
        },
        {
            associatedZone: SystemType.Laboratory,
            position: { x: 26.608002, y: -8.808 },    
        },
        {
            associatedZone: SystemType.Laboratory,
            position: { x: 24.780003, y: -9.5651 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: 17.293001, y: -10.882 },    
        },
        {
            associatedZone: SystemType.Decontamination,
            position: { x: 25.512001, y: -24.559002 },    
        },
        {
            associatedZone: SystemType.Decontamination,
            position: { x: 23.897001, y: -23.512001 },    
        },
        {
            associatedZone: SystemType.Decontamination,
            position: { x: 37.992004, y: -9.6214 },    
        },
        {
            associatedZone: SystemType.Decontamination,
            position: { x: 39.067, y: -11.361 },    
        },
    ],
    [GameMap.AprilFoolsTheSkeld]: [
        {
            associatedZone: SystemType.Cafeteria,
            position: { x: -5.1432004, y: 1.3355999 },    
        },
        {
            associatedZone: SystemType.Cafeteria,
            position: { x: 0.708, y: -4.992 },    
        },
        {
            associatedZone: SystemType.Cafeteria,
            position: { x: 6.3936, y: 1.33848 },    
        },
        {
            associatedZone: SystemType.Electrical,
            position: { x: 9.53616, y: -13.416001 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: -1.1316001, y: -11.98128 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: 0.70919997, y: -8.560801 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: 5.268, y: -14.2884 },    
        },
        {
            associatedZone: SystemType.LowerEngine,
            position: { x: 14.6808, y: -11.472 },    
        },
        {
            associatedZone: SystemType.LowerEngine,
            position: { x: 16.930801, y: -8.9664 },    
        },
        {
            associatedZone: SystemType.UpperEngine,
            position: { x: 14.676002, y: 1.3406401 },    
        },
        {
            associatedZone: SystemType.UpperEngine,
            position: { x: 16.930801, y: -2.1276002 },    
        },
        {
            associatedZone: SystemType.Security,
            position: { x: 14.734801, y: -5.1417603 },    
        },
        {
            associatedZone: SystemType.MedBay,
            position: { x: 9.1452, y: -0.4439999 },    
        },
    ],
    [GameMap.Airship]: [
        {
            associatedZone: SystemType.Comms,
            position: { x: -16.191698, y: -0.90999997 },    
        },
        {
            associatedZone: SystemType.Comms,
            position: { x: -8.663198, y: -0.9099996 },    
        },
        {
            associatedZone: SystemType.Comms,
            position: { x: -13.362299, y: -0.015400052 },    
        },
        {
            associatedZone: SystemType.Comms,
            position: { x: -10.975999, y: -2.3309999 },    
        },
        {
            associatedZone: SystemType.Brig,
            position: { x: -0.9260999, y: 7.100799 },    
        },
        {
            associatedZone: SystemType.Brig,
            position: { x: -3.6364996, y: 8.784999 },    
        },
        {
            associatedZone: SystemType.Brig,
            position: { x: 2.7145998, y: 8.850798 },    
        },
        {
            associatedZone: SystemType.Kitchen,
            position: { x: -8.764699, y: -7.2687993 },    
        },
        {
            associatedZone: SystemType.Kitchen,
            position: { x: -8.764699, y: -11.976298 },    
        },
        {
            associatedZone: SystemType.Kitchen,
            position: { x: -1.4979999, y: -12.040699 },    
        },
        {
            associatedZone: SystemType.MainHall,
            position: { x: 4.2496986, y: 0.042 },    
        },
        {
            associatedZone: SystemType.MainHall,
            position: { x: 17.490198, y: 0.04619999 },    
        },
        {
            associatedZone: SystemType.Records,
            position: { x: 16.382797, y: 9.368099 },    
        },
        {
            associatedZone: SystemType.Records,
            position: { x: 23.97472, y: 9.368099 },    
        },
        {
            associatedZone: SystemType.Records,
            position: { x: 19.858297, y: 5.601399 },    
        },
        {
            associatedZone: SystemType.Lounge,
            position: { x: 29.2544, y: 6.6990004 },    
        },
        {
            associatedZone: SystemType.Lounge,
            position: { x: 30.7944, y: 6.6990004 },    
        },
        {
            associatedZone: SystemType.Lounge,
            position: { x: 32.2924, y: 6.6990004 },    
        },
        {
            associatedZone: SystemType.Lounge,
            position: { x: 33.7771, y: 6.6990004 },    
        },
        {
            associatedZone: SystemType.Medical,
            position: { x: 21.314297, y: -8.416099 },    
        },
        {
            associatedZone: SystemType.Medical,
            position: { x: 32.540195, y: -4.694899 },    
        },
    ],
    [GameMap.Fungle]: [
        {
            associatedZone: SystemType.Comms,
            position: { x: 24.067001, y: 11.974 },    
        },
        {
            associatedZone: SystemType.Comms,
            position: { x: 18.48, y: 13.298 },    
        },
        {
            associatedZone: SystemType.Kitchen,
            position: { x: -15.509, y: -5.913 },    
        },
        {
            associatedZone: SystemType.Laboratory,
            position: { x: -4.3, y: -7.759 },    
        },
        {
            associatedZone: SystemType.Lookout,
            position: { x: 11.063, y: 3.1330001 },    
        },
        {
            associatedZone: SystemType.MiningPit,
            position: { x: 12.733, y: 6.4160004 },    
        },
        {
            associatedZone: SystemType.Reactor,
            position: { x: 19.43, y: -6.59 },    
        },
        {
            associatedZone: SystemType.Storage,
            position: { x: -1.6159999, y: 4.6280003 },    
        },
    ],
};