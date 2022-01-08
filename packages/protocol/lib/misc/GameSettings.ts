import {
    GameMap,
    KillDistance,
    GameKeyword,
    TaskBarUpdate,
    RoleType,
} from "@skeldjs/constant";

import { DeepPartial, HazelReader, HazelWriter } from "@skeldjs/util";

export interface RoleChanceSettings {
    maxPlayers: number;
    chance: number;
}

export interface AllRoleSettings {
    roleChances: Partial<Record<RoleType, RoleChanceSettings>>;
    shapeshifterLeaveSkin: boolean;
    shapeshifterCooldown: number;
    shapeshiftDuration: number;
    scientistCooldown: number;
    guardianAngelCooldown: number;
    engineerCooldown: number;
    engineerInVentMaxTime: number;
    scientistBatteryCharge: number;
    protectionDurationSeconds: number;
    impostorsCanSeeProtected: boolean;
}

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
    roleSettings: AllRoleSettings;
}

export class RoleSettings implements AllRoleSettings {
    static isValid(settings: RoleSettings) {
        const roleChances = Object.entries(settings.roleChances);
        for (const [ , roleChance ] of roleChances) {
            if (roleChance.maxPlayers < 0 || roleChance.maxPlayers > 15) {
                return false;
            }
            if (roleChance.chance < 0 || roleChance.chance > 100) {
                return false;
            }
        }
        if (settings.shapeshifterCooldown < 5 || settings.shapeshifterCooldown > 0) {
            return false;
        }
        if (settings.shapeshiftDuration < 0 || settings.shapeshiftDuration > 30) {
            return false;
        }
        if (settings.scientistCooldown < 5 || settings.scientistCooldown > 60) {
            return false;
        }
        if (settings.guardianAngelCooldown < 35 || settings.guardianAngelCooldown > 120) {
            return false;
        }
        if (settings.engineerCooldown < 5 || settings.engineerCooldown > 60) {
            return false;
        }
        if (settings.engineerInVentMaxTime < 0 || settings.engineerInVentMaxTime > 60) {
            return false;
        }
        if (settings.scientistBatteryCharge < 5 || settings.scientistBatteryCharge > 30) {
            return false;
        }
        if (settings.protectionDurationSeconds < 5 || settings.protectionDurationSeconds > 30) {
            return false;
        }
        return true;
    }

    roleChances: Partial<Record<RoleType, RoleChanceSettings>>;
    shapeshifterLeaveSkin: boolean;
    shapeshifterCooldown: number;
    shapeshiftDuration: number;
    scientistCooldown: number;
    guardianAngelCooldown: number;
    engineerCooldown: number;
    engineerInVentMaxTime: number;
    scientistBatteryCharge: number;
    protectionDurationSeconds: number;
    impostorsCanSeeProtected: boolean;

    constructor(roleSettings: DeepPartial<AllRoleSettings>) {
        this.roleChances = {
            [RoleType.Scientist]: {
                maxPlayers: 0,
                chance: 0
            },
            [RoleType.Engineer]: {
                maxPlayers: 0,
                chance: 0
            },
            [RoleType.GuardianAngel]: {
                maxPlayers: 0,
                chance: 0
            },
            [RoleType.Shapeshifter]: {
                maxPlayers: 0,
                chance: 0
            }
        };

        if (roleSettings.roleChances) {
            const roleChances = Object.entries(roleSettings.roleChances);
            for (const [ roleType, roleChance ] of roleChances) {
                this.roleChances[roleType as unknown as RoleType] = {
                    maxPlayers: 0,
                    chance: 0,
                    ...roleChance
                };
            }
        }

        this.shapeshifterLeaveSkin = roleSettings.shapeshifterLeaveSkin || false;
        this.shapeshifterCooldown = roleSettings.shapeshifterCooldown ?? 10;
        this.shapeshiftDuration = roleSettings.shapeshiftDuration ?? 30;
        this.scientistCooldown = roleSettings.scientistCooldown ?? 15;
        this.guardianAngelCooldown = roleSettings.guardianAngelCooldown ?? 60;
        this.engineerCooldown = roleSettings.engineerCooldown ?? 30;
        this.engineerInVentMaxTime = roleSettings.engineerInVentMaxTime ?? 15;
        this.scientistBatteryCharge = roleSettings.scientistBatteryCharge ?? 5;
        this.protectionDurationSeconds = roleSettings.protectionDurationSeconds ?? 10;
        this.impostorsCanSeeProtected = roleSettings.impostorsCanSeeProtected || false;
    }

    patch(settings: Partial<AllRoleSettings>) {
        this.roleChances = settings.roleChances || this.roleChances;
        this.shapeshifterLeaveSkin = settings.shapeshifterLeaveSkin ?? this.shapeshifterLeaveSkin;
        this.shapeshifterCooldown = settings.shapeshifterCooldown ?? this.shapeshifterCooldown;
        this.shapeshiftDuration = settings.shapeshiftDuration ?? this.shapeshiftDuration;
        this.scientistCooldown = settings.scientistCooldown ?? this.scientistCooldown;
        this.guardianAngelCooldown = settings.guardianAngelCooldown ?? this.guardianAngelCooldown;
        this.engineerCooldown = settings.engineerCooldown ?? this.engineerCooldown;
        this.engineerInVentMaxTime = settings.engineerInVentMaxTime ?? this.engineerInVentMaxTime;
        this.scientistBatteryCharge = settings.scientistBatteryCharge ?? this.scientistBatteryCharge;
        this.protectionDurationSeconds = settings.protectionDurationSeconds ?? this.protectionDurationSeconds;
        this.impostorsCanSeeProtected = settings.impostorsCanSeeProtected ?? this.impostorsCanSeeProtected;
    }

    static Deserialize(reader: HazelReader) {
        const roleSettingsData = new RoleSettings({});
        roleSettingsData.Deserialize(reader);
        return roleSettingsData;
    }

    Deserialize(reader: HazelReader) {
        const numRoles = reader.int32();
        for (let i = 0; i < numRoles; i++) {
            const roleType = reader.uint16() as RoleType;
            const maxPlayers = reader.uint8();
            const chance = reader.uint8();

            this.roleChances[roleType] = {
                maxPlayers,
                chance
            };
        }

        this.shapeshifterLeaveSkin = reader.bool();
        this.shapeshifterCooldown = reader.uint8();
        this.shapeshiftDuration = reader.uint8();
        this.scientistCooldown = reader.uint8();
        this.guardianAngelCooldown = reader.uint8();
        this.engineerCooldown = reader.uint8();
        this.engineerInVentMaxTime = reader.uint8();
        this.scientistBatteryCharge = reader.uint8();
        this.protectionDurationSeconds = reader.uint8();
        this.impostorsCanSeeProtected = reader.bool();
    }

    Serialize(writer: HazelWriter) {
        const roleChances = Object.entries(this.roleChances);
        writer.int32(roleChances.length);
        for (const [ roleType, roleChance ] of roleChances) {
            writer.uint16(parseInt(roleType));
            writer.uint8(roleChance.maxPlayers);
            writer.uint8(roleChance.chance);
        }
        writer.bool(this.shapeshifterLeaveSkin);
        writer.uint8(this.shapeshifterCooldown);
        writer.uint8(this.shapeshiftDuration);
        writer.uint8(this.scientistCooldown);
        writer.uint8(this.guardianAngelCooldown);
        writer.uint8(this.engineerCooldown);
        writer.uint8(this.engineerInVentMaxTime);
        writer.uint8(this.scientistBatteryCharge);
        writer.uint8(this.protectionDurationSeconds);
        writer.bool(this.impostorsCanSeeProtected);
    }
}

export class GameSettings {
    static isValid(settings: GameSettings) {
        if (settings.maxPlayers < 4 || settings.maxPlayers > 10) {
            return false;
        }

        if (!(settings.keywords in GameKeyword)) {
            return false;
        }

        if (!(settings.map in GameMap)) {
            return false;
        }

        if (settings.numImpostors < 1 || settings.numImpostors > 3) {
            return false;
        }

        if (settings.numEmergencies > 9) {
            return false;
        }

        if (settings.emergencyCooldown < 0 || settings.emergencyCooldown > 60) {
            return false;
        }

        if (settings.discussionTime < 0 || settings.discussionTime > 120) {
            return false;
        }

        if (settings.votingTime < 0 || settings.votingTime > 300) {
            return false;
        }

        if (settings.playerSpeed < 0.5 || settings.playerSpeed > 3) {
            return false;
        }

        if (settings.crewmateVision < 0.25 || settings.crewmateVision > 5) {
            return false;
        }

        if (settings.impostorVision < 0.25 || settings.impostorVision > 5) {
            return false;
        }

        if (settings.killCooldown < 10 || settings.killCooldown > 60) {
            return false;
        }

        if (!(settings.killDistance in KillDistance)) {
            return false;
        }

        if (!(settings.taskbarUpdates in TaskBarUpdate)) {
            return false;
        }

        if (settings.commonTasks < 0 || settings.commonTasks > 2) {
            return false;
        }

        if (settings.longTasks < 0 || settings.longTasks > 3) {
            return false;
        }

        if (settings.shortTasks < 0 || settings.shortTasks > 5) {
            return false;
        }

        if (!RoleSettings.isValid(settings.roleSettings)) {
            return false;
        }

        return true;
    }

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

    roleSettings: RoleSettings;

    constructor(settings: DeepPartial<AllGameSettings> = {}) {
        this.maxPlayers = settings.maxPlayers ?? 10;
        this.keywords = settings.keywords ?? GameKeyword.Other;
        this.map = settings.map ?? GameMap.MiraHQ;
        this.playerSpeed = settings.playerSpeed ?? 1;
        this.crewmateVision = settings.crewmateVision ?? 1;
        this.impostorVision = settings.impostorVision ?? 1.5;
        this.killCooldown = settings.killCooldown ?? 45;
        this.commonTasks = settings.commonTasks ?? 1;
        this.longTasks = settings.longTasks ?? 1;
        this.shortTasks = settings.shortTasks ?? 2;
        this.numEmergencies = settings.numEmergencies ?? 1;
        this.numImpostors = settings.numImpostors ?? 1;
        this.killDistance = settings.killDistance ?? KillDistance.Medium;
        this.discussionTime = settings.discussionTime ?? 15;
        this.votingTime = settings.votingTime ?? 120;
        this.isDefaults = settings.isDefaults ?? false;
        this.emergencyCooldown = settings.emergencyCooldown ?? 15;
        this.confirmEjects = settings.confirmEjects ?? true;
        this.visualTasks = settings.visualTasks ?? true;
        this.anonymousVotes = settings.anonymousVotes ?? false;
        this.taskbarUpdates = settings.taskbarUpdates ?? TaskBarUpdate.Always;

        this.roleSettings = new RoleSettings(settings.roleSettings || {});
    }

    patch(settings: Partial<AllGameSettings>) {
        this.maxPlayers = settings.maxPlayers ?? this.maxPlayers;
        this.keywords = settings.keywords ?? this.keywords;
        this.map = settings.map ?? this.map;
        this.playerSpeed = settings.playerSpeed ?? this.playerSpeed;
        this.crewmateVision = settings.crewmateVision ?? this.crewmateVision;
        this.impostorVision = settings.impostorVision ?? this.impostorVision;
        this.killCooldown = settings.killCooldown ?? this.killCooldown;
        this.commonTasks = settings.commonTasks ?? this.commonTasks;
        this.longTasks = settings.longTasks ?? this.longTasks;
        this.shortTasks = settings.shortTasks ?? this.shortTasks;
        this.numEmergencies = settings.numEmergencies ?? this.numEmergencies;
        this.numImpostors = settings.numImpostors ?? this.numImpostors;
        this.killDistance = settings.killDistance ?? this.killDistance;
        this.discussionTime = settings.discussionTime ?? this.discussionTime;
        this.votingTime = settings.votingTime ?? this.votingTime;
        this.isDefaults = settings.isDefaults ?? this.isDefaults;
        this.emergencyCooldown = settings.emergencyCooldown ?? this.emergencyCooldown;
        this.confirmEjects = settings.confirmEjects ?? this.confirmEjects;
        this.visualTasks = settings.visualTasks ?? this.visualTasks;
        this.anonymousVotes = settings.anonymousVotes ?? this.anonymousVotes;
        this.taskbarUpdates = settings.taskbarUpdates ?? this.taskbarUpdates;

        if (settings.roleSettings) {
            this.roleSettings.patch(settings.roleSettings);
        }
    }

    static Deserialize(reader: HazelReader) {
        const gameOptions = new GameSettings;
        gameOptions.Deserialize(reader);
        return gameOptions;
    }

    Deserialize(reader: HazelReader) {
        const length = reader.upacked();
        const settingsReader = reader.bytes(length);

        const version = settingsReader.uint8();

        this.maxPlayers = settingsReader.uint8();
        this.keywords = settingsReader.uint32();
        this.map = settingsReader.uint8();
        this.playerSpeed = settingsReader.float();
        this.crewmateVision = settingsReader.float();
        this.impostorVision = settingsReader.float();
        this.killCooldown = settingsReader.float();
        this.commonTasks = settingsReader.uint8();
        this.longTasks = settingsReader.uint8();
        this.shortTasks = settingsReader.uint8();
        this.numEmergencies = settingsReader.uint32();
        this.numImpostors = settingsReader.uint8();
        this.killDistance = settingsReader.uint8();
        this.discussionTime = settingsReader.uint32();
        this.votingTime = settingsReader.uint32();
        this.isDefaults = settingsReader.bool();

        if (version >= 2) {
            this.emergencyCooldown = settingsReader.uint8();
            if (version >= 3) {
                this.confirmEjects = settingsReader.bool();
                this.visualTasks = settingsReader.bool();
                if (version >= 4) {
                    this.anonymousVotes = settingsReader.bool();
                    this.taskbarUpdates = settingsReader.uint8();
                    if (version >= 5) {
                        this.roleSettings.Deserialize(settingsReader);
                    }
                }
            }
        }
    }

    Serialize(writer: HazelWriter, version: number) {
        const owriter = HazelWriter.alloc(42);
        owriter.uint8(version);
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
        if (version >= 2) {
            owriter.uint8(this.emergencyCooldown);
            if (version >= 3) {
                owriter.bool(this.confirmEjects);
                owriter.bool(this.visualTasks);
                if (version >= 4) {
                    owriter.bool(this.anonymousVotes);
                    owriter.uint8(this.taskbarUpdates);

                    if (version >= 5) {
                        owriter.write(this.roleSettings);
                    }
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
