import {
    GameMap,
    KillDistance,
    GameKeyword,
    TaskBarUpdate,
} from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

export interface AllGameSettings {
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

export class GameSettings implements AllGameSettings {
    static isValid(options: GameSettings) {
        if (options.maxPlayers < 4 || options.maxPlayers > 10) {
            return false;
        }

        if (!(options.keywords in GameKeyword)) {
            return false;
        }

        if (!(options.map in GameMap)) {
            return false;
        }

        if (options.numImpostors < 1 || options.numImpostors > 3) {
            return false;
        }

        if (options.numEmergencies > 9) {
            return false;
        }

        if (options.emergencyCooldown < 0 || options.emergencyCooldown > 60) {
            return false;
        }

        if (options.discussionTime < 0 || options.discussionTime > 120) {
            return false;
        }

        if (options.votingTime < 0 || options.votingTime > 300) {
            return false;
        }

        if (options.playerSpeed < 0.5 || options.playerSpeed > 3) {
            return false;
        }

        if (options.crewmateVision < 0.25 || options.crewmateVision > 5) {
            return false;
        }

        if (options.impostorVision < 0.25 || options.impostorVision > 5) {
            return false;
        }

        if (options.killCooldown < 10 || options.killCooldown > 60) {
            return false;
        }

        if (!(options.killDistance in KillDistance)) {
            return false;
        }

        if (!(options.taskbarUpdates in TaskBarUpdate)) {
            return false;
        }

        if (options.commonTasks < 0 || options.commonTasks > 2) {
            return false;
        }

        if (options.longTasks < 0 || options.longTasks > 3) {
            return false;
        }

        if (options.shortTasks < 0 || options.shortTasks > 5) {
            return false;
        }

        return true;
    }

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

    constructor(options: Partial<AllGameSettings> = {}) {
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

    patch(options: Partial<AllGameSettings>) {
        this.version = options.version ?? this.version;
        this.maxPlayers = options.maxPlayers ?? this.maxPlayers;
        this.keywords = options.keywords ?? this.keywords;
        this.map = options.map ?? this.map;
        this.playerSpeed = options.playerSpeed ?? this.playerSpeed;
        this.crewmateVision = options.crewmateVision ?? this.crewmateVision;
        this.impostorVision = options.impostorVision ?? this.impostorVision;
        this.killCooldown = options.killCooldown ?? this.killCooldown;
        this.commonTasks = options.commonTasks ?? this.commonTasks;
        this.longTasks = options.longTasks ?? this.longTasks;
        this.shortTasks = options.shortTasks ?? this.shortTasks;
        this.numEmergencies = options.numEmergencies ?? this.numEmergencies;
        this.numImpostors = options.numImpostors ?? this.numImpostors;
        this.killDistance = options.killDistance ?? this.killDistance;
        this.discussionTime = options.discussionTime ?? this.discussionTime;
        this.votingTime = options.votingTime ?? this.votingTime;
        this.isDefaults = options.isDefaults ?? this.isDefaults;
        this.emergencyCooldown = options.emergencyCooldown ?? this.emergencyCooldown;
        this.confirmEjects = options.confirmEjects ?? this.confirmEjects;
        this.visualTasks = options.visualTasks ?? this.visualTasks;
        this.anonymousVotes = options.anonymousVotes ?? this.anonymousVotes;
        this.taskbarUpdates = options.taskbarUpdates ?? this.taskbarUpdates;
    }

    static Deserialize(reader: HazelReader) {
        const gameOptions = new GameSettings;
        gameOptions.Deserialize(reader);
        return gameOptions;
    }

    Deserialize(reader: HazelReader) {
        const length = reader.upacked();
        const oreader = reader.bytes(length);

        this.version = oreader.uint8();
        this.maxPlayers = oreader.uint8();
        this.keywords = oreader.uint32();
        this.map = oreader.uint8();
        this.playerSpeed = oreader.float();
        this.crewmateVision = oreader.float();
        this.impostorVision = oreader.float();
        this.killCooldown = oreader.float();
        this.commonTasks = oreader.uint8();
        this.longTasks = oreader.uint8();
        this.shortTasks = oreader.uint8();
        this.numEmergencies = oreader.uint32();
        this.numImpostors = oreader.uint8();
        this.killDistance = oreader.uint8();
        this.discussionTime = oreader.uint32();
        this.votingTime = oreader.uint32();
        this.isDefaults = oreader.bool();

        if (this.version >= 2) {
            this.emergencyCooldown = oreader.uint8();

            if (this.version >= 3) {
                this.confirmEjects = oreader.bool();
                this.visualTasks = oreader.bool();

                if (this.version >= 4) {
                    this.anonymousVotes = oreader.bool();
                    this.taskbarUpdates = oreader.uint8();
                }
            }
        }

        return this;
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

    clone() {
        return new GameSettings(this);
    }
}
