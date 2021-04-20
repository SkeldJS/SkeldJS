import {
    GameMap,
    KillDistance,
    GameKeyword,
    TaskBarUpdate,
} from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

export interface AllGameOptions {
    version: number;
    maxPlayers: number;
    keywords: GameKeyword;
    map: GameMap;
    playerSpeed: number;
    crewmateVision: number;
    impostorVision: number;
    killCooldown: number;
    commonTasks: number;
    longTasks: number;
    shortTasks: number;
    numEmergencies: number;
    numImpostors: number;
    killDistance: KillDistance;
    discussionTime: number;
    votingTime: number;
    isDefaults: boolean;
    emergencyCooldown: number;
    confirmEjects: boolean;
    visualTasks: boolean;
    anonymousVotes: boolean;
    taskbarUpdates: TaskBarUpdate;
}

export class GameOptions implements AllGameOptions {
    version: number;
    maxPlayers: number;
    keywords: GameKeyword;
    map: GameMap;
    playerSpeed: number;
    crewmateVision: number;
    impostorVision: number;
    killCooldown: number;
    commonTasks: number;
    longTasks: number;
    shortTasks: number;
    numEmergencies: number;
    numImpostors: number;
    killDistance: KillDistance;
    discussionTime: number;
    votingTime: number;
    isDefaults: boolean;
    emergencyCooldown: number;
    confirmEjects: boolean;
    visualTasks: boolean;
    anonymousVotes: boolean;
    taskbarUpdates: TaskBarUpdate;

    constructor(options: Partial<AllGameOptions> = {}) {
        this.patch(options);
    }

    patch(options: Partial<AllGameOptions>) {
        this.version = options.version ?? 4;
        this.maxPlayers = options.maxPlayers ?? 10;
        this.keywords = options.keywords ?? GameKeyword.Other;
        this.map = options.map ?? GameMap.MiraHQ;
        this.playerSpeed = options.playerSpeed ?? 1;
        this.crewmateVision = options.crewmateVision ?? 1;
        this.impostorVision = options.impostorVision ?? 1.5;
        this.killCooldown = options.killCooldown ?? 45;
        this.commonTasks = options.commonTasks ?? 1;
        this.longTasks = options.longTasks ?? 1;
        this.shortTasks = options.shortTasks ?? 2;
        this.numEmergencies = options.numEmergencies ?? 1;
        this.numImpostors = options.numImpostors ?? 1;
        this.killDistance = options.killDistance ?? KillDistance.Medium;
        this.discussionTime = options.discussionTime ?? 15;
        this.votingTime = options.votingTime ?? 120;
        this.isDefaults = options.isDefaults ?? false;
        this.emergencyCooldown = options.emergencyCooldown ?? 15;
        this.confirmEjects = options.confirmEjects ?? true;
        this.visualTasks = options.visualTasks ?? true;
        this.anonymousVotes = options.anonymousVotes ?? false;
        this.taskbarUpdates = options.taskbarUpdates ?? TaskBarUpdate.Always;
    }

    static Deserialize(reader: HazelReader) {
        const length = reader.upacked();
        const oreader = reader.bytes(length);
        const options: Partial<AllGameOptions> = {};

        options.version = oreader.uint8();
        options.maxPlayers = oreader.uint8();
        options.keywords = oreader.uint32();
        options.map = oreader.uint8();
        options.playerSpeed = oreader.float();
        options.crewmateVision = oreader.float();
        options.impostorVision = oreader.float();
        options.killCooldown = oreader.float();
        options.commonTasks = oreader.uint8();
        options.longTasks = oreader.uint8();
        options.shortTasks = oreader.uint8();
        options.numEmergencies = oreader.uint32();
        options.numImpostors = oreader.uint8();
        options.killDistance = oreader.uint8();
        options.discussionTime = oreader.uint32();
        options.votingTime = oreader.uint32();
        options.isDefaults = oreader.bool();

        if (options.version >= 2) {
            options.emergencyCooldown = oreader.uint8();

            if (options.version >= 3) {
                options.confirmEjects = oreader.bool();
                options.visualTasks = oreader.bool();

                if (options.version >= 4) {
                    options.anonymousVotes = oreader.bool();
                    options.taskbarUpdates = oreader.uint8();
                }
            }
        }

        return new GameOptions(options);
    }

    Serialize(writer: HazelWriter) {
        const owriter = HazelWriter.alloc(42);
        owriter.uint8(this.version);
        owriter.uint8(this.maxPlayers);
        owriter.uint32(this.keywords);
        owriter.uint8(this.map);
        owriter.float(this.playerSpeed);
        owriter.float(this.crewmateVision);
        owriter.float(this.impostorVision);
        owriter.float(this.killCooldown);
        owriter.uint8(this.commonTasks);
        owriter.uint8(this.longTasks);
        owriter.uint8(this.shortTasks);
        owriter.uint32(this.numEmergencies);
        owriter.uint8(this.numImpostors);
        owriter.uint8(this.killDistance);
        owriter.uint32(this.discussionTime);
        owriter.uint32(this.votingTime);
        owriter.bool(this.isDefaults);

        if (this.version >= 2) {
            owriter.uint8(this.emergencyCooldown);

            if (this.version >= 3) {
                owriter.bool(this.confirmEjects);
                owriter.bool(this.visualTasks);

                if (this.version >= 4) {
                    owriter.bool(this.anonymousVotes);
                    owriter.uint8(this.taskbarUpdates);
                }
            }
        }
        writer.upacked(owriter.size);
        writer.bytes(owriter);
    }
}
