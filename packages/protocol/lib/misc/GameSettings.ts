import {
    GameMap,
    KillDistance,
    GameKeyword,
    TaskBarMode,
    RoleType,
    GameMode,
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
    taskbarUpdates: TaskBarMode;
    roleSettings: AllRoleSettings;
    crewmateVentUses: number;
    hidingTime: number;
    crewmateFlashlightSize: number;
    impostorFlashlightSize: number;
    useFlashlight: boolean;
    finalHideSeekMap: boolean;
    finalHideTime: number;
    finalSeekerSpeed: number;
    finalHidePing: boolean;
    showNames: boolean;
    seekerPlayerId: number;
    maxPingTime: number;
    crewmateTimeInVent: number;
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

    scientistCooldown: number;
    scientistBatteryCharge: number;

    engineerCooldown: number;
    engineerInVentMaxTime: number;

    guardianAngelCooldown: number;
    protectionDurationSeconds: number;
    impostorsCanSeeProtected: boolean;

    shapeshifterLeaveSkin: boolean;
    shapeshifterCooldown: number;
    shapeshiftDuration: number;

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

    static Deserialize(reader: HazelReader, version: number) {
        const roleSettingsData = new RoleSettings({});
        roleSettingsData.Deserialize(reader, version);
        return roleSettingsData;
    }

    Deserialize(reader: HazelReader, version: number) {
        if (version >= 7) {
            const numRoles = reader.upacked();
            for (let i = 0; i < numRoles; i++) {
                const roleType = reader.uint16() as RoleType;
                const maxPlayers = reader.uint8();
                const chance = reader.uint8();

                this.roleChances[roleType] = {
                    maxPlayers,
                    chance
                };

                const [ , mreader ] = reader.message();

                switch (roleType) {
                case RoleType.Scientist:
                    this.scientistCooldown = mreader.uint8();
                    this.scientistBatteryCharge = mreader.uint8();
                    break;
                case RoleType.Engineer:
                    this.engineerCooldown = mreader.uint8();
                    this.engineerInVentMaxTime = mreader.uint8();
                    break;
                case RoleType.GuardianAngel:
                    this.guardianAngelCooldown = mreader.uint8();
                    this.protectionDurationSeconds = mreader.uint8();
                    this.impostorsCanSeeProtected = mreader.bool();
                    break;
                case RoleType.Shapeshifter:
                    this.shapeshifterLeaveSkin = mreader.bool();
                    this.shapeshifterCooldown = mreader.uint8();
                    this.shapeshiftDuration = mreader.uint8();
                    break;
                }
            }
            return;
        }

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

    Serialize(writer: HazelWriter, version: number) {
        if (version >= 7) {
            // TODO: allow custom role settings
            const roleChances = Object.entries(this.roleChances);
            writer.upacked(roleChances.length);
            for (let i = 0; i < roleChances.length; i++) {
                const [ roleType, roleChance ] = roleChances[i];

                writer.uint16(parseInt(roleType));
                writer.uint8(roleChance.maxPlayers);
                writer.uint8(roleChance.chance);

                writer.begin(0);

                switch (parseInt(roleType)) {
                case RoleType.Scientist:
                    writer.uint8(this.scientistCooldown);
                    writer.uint8(this.scientistBatteryCharge);
                    break;
                case RoleType.Engineer:
                    writer.uint8(this.engineerCooldown);
                    writer.uint8(this.engineerInVentMaxTime);
                    break;
                case RoleType.GuardianAngel:
                    writer.uint8(this.guardianAngelCooldown);
                    writer.uint8(this.protectionDurationSeconds);
                    writer.bool(this.impostorsCanSeeProtected);
                    break;
                case RoleType.Shapeshifter:
                    writer.bool(this.shapeshifterLeaveSkin);
                    writer.uint8(this.shapeshifterCooldown);
                    writer.uint8(this.shapeshiftDuration);
                    break;
                }

                writer.end();
            }
            return;
        }

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

        if (!(settings.taskbarUpdates in TaskBarMode)) {
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

    gameMode: GameMode;

    maxPlayers: number;
    keywords: GameKeyword;
    map: GameMap;
    playerSpeed: number;
    crewmateVision: number;
    impostorVision: number;
    commonTasks: number;
    longTasks: number;
    shortTasks: number;
    isDefaults: boolean;

    killCooldown: number;
    numEmergencies: number;
    numImpostors: number;
    killDistance: KillDistance;
    discussionTime: number;
    votingTime: number;
    emergencyCooldown: number;
    confirmEjects: boolean;
    visualTasks: boolean;
    anonymousVotes: boolean;
    taskbarUpdates: TaskBarMode;
    roleSettings: RoleSettings;

    crewmateVentUses: number;
    hidingTime: number;
    crewmateFlashlightSize: number;
    impostorFlashlightSize: number;
    useFlashlight: boolean;
    finalHideSeekMap: boolean;
    finalHideTime: number;
    finalSeekerSpeed: number;
    finalHidePing: boolean;
    showNames: boolean;
    seekerPlayerId: number;
    maxPingTime: number;
    crewmateTimeInVent: number;

    constructor(settings: DeepPartial<AllGameSettings> = {}) {
        this.gameMode = GameMode.Normal;

        this.maxPlayers = settings.maxPlayers ?? 10;
        this.keywords = settings.keywords ?? GameKeyword.Other;
        this.map = settings.map ?? GameMap.MiraHQ;
        this.playerSpeed = settings.playerSpeed ?? 1;
        this.crewmateVision = settings.crewmateVision ?? 1;
        this.impostorVision = settings.impostorVision ?? 1.5;
        this.commonTasks = settings.commonTasks ?? 1;
        this.longTasks = settings.longTasks ?? 1;
        this.shortTasks = settings.shortTasks ?? 2;
        this.isDefaults = settings.isDefaults ?? false;

        this.killCooldown = settings.killCooldown ?? 45;
        this.numEmergencies = settings.numEmergencies ?? 1;
        this.numImpostors = settings.numImpostors ?? 1;
        this.killDistance = settings.killDistance ?? KillDistance.Medium;
        this.discussionTime = settings.discussionTime ?? 15;
        this.votingTime = settings.votingTime ?? 120;
        this.emergencyCooldown = settings.emergencyCooldown ?? 15;
        this.confirmEjects = settings.confirmEjects ?? true;
        this.visualTasks = settings.visualTasks ?? true;
        this.anonymousVotes = settings.anonymousVotes ?? false;
        this.taskbarUpdates = settings.taskbarUpdates ?? TaskBarMode.Normal;

        this.crewmateVentUses = settings.crewmateVentUses ?? 1;
        this.hidingTime = settings.hidingTime ?? 200;
        this.crewmateFlashlightSize = settings.crewmateFlashlightSize ?? 0.35;
        this.impostorFlashlightSize = settings.impostorFlashlightSize ?? 0.25;
        this.useFlashlight = settings.useFlashlight ?? true;
        this.finalHideSeekMap = settings.finalHideSeekMap ?? true;
        this.finalHideTime = settings.finalHideTime ?? 50;
        this.finalSeekerSpeed = 1.2;
        this.finalHidePing = settings.finalHidePing ?? true;
        this.showNames = settings.showNames ?? true;
        this.seekerPlayerId = settings.seekerPlayerId ?? 0xffffffff;
        this.maxPingTime = settings.maxPingTime ?? 6;
        this.crewmateTimeInVent = settings.crewmateTimeInVent ?? 3;

        this.roleSettings = new RoleSettings(settings.roleSettings || {});
    }

    patch(settings: Partial<AllGameSettings>) {
        this.maxPlayers = settings.maxPlayers ?? this.maxPlayers;
        this.keywords = settings.keywords ?? this.keywords;
        this.map = settings.map ?? this.map;
        this.playerSpeed = settings.playerSpeed ?? this.playerSpeed;
        this.crewmateVision = settings.crewmateVision ?? this.crewmateVision;
        this.impostorVision = settings.impostorVision ?? this.impostorVision;
        this.commonTasks = settings.commonTasks ?? this.commonTasks;
        this.longTasks = settings.longTasks ?? this.longTasks;
        this.shortTasks = settings.shortTasks ?? this.shortTasks;
        this.isDefaults = settings.isDefaults ?? this.isDefaults;

        this.killCooldown = settings.killCooldown ?? this.killCooldown;
        this.numEmergencies = settings.numEmergencies ?? this.numEmergencies;
        this.numImpostors = settings.numImpostors ?? this.numImpostors;
        this.killDistance = settings.killDistance ?? this.killDistance;
        this.discussionTime = settings.discussionTime ?? this.discussionTime;
        this.votingTime = settings.votingTime ?? this.votingTime;
        this.emergencyCooldown = settings.emergencyCooldown ?? this.emergencyCooldown;
        this.confirmEjects = settings.confirmEjects ?? this.confirmEjects;
        this.visualTasks = settings.visualTasks ?? this.visualTasks;
        this.anonymousVotes = settings.anonymousVotes ?? this.anonymousVotes;
        this.taskbarUpdates = settings.taskbarUpdates ?? this.taskbarUpdates;

        this.crewmateVentUses = settings.crewmateVentUses ?? this.crewmateVentUses;
        this.hidingTime = settings.hidingTime ?? this.hidingTime;
        this.crewmateFlashlightSize = settings.crewmateFlashlightSize ?? this.crewmateFlashlightSize;
        this.impostorFlashlightSize = settings.impostorFlashlightSize ?? this.impostorFlashlightSize;
        this.useFlashlight = settings.useFlashlight ?? this.useFlashlight;
        this.finalHideSeekMap = settings.finalHideSeekMap ?? this.finalHideSeekMap;
        this.finalHideTime = settings.finalHideTime ?? this.finalHideTime;
        this.finalSeekerSpeed = settings.finalSeekerSpeed ?? this.finalSeekerSpeed;
        this.finalHidePing = settings.finalHidePing ?? this.finalHidePing;
        this.showNames = settings.showNames ?? this.showNames;
        this.seekerPlayerId = settings.seekerPlayerId ?? this.seekerPlayerId;
        this.maxPingTime = settings.maxPingTime ?? this.maxPingTime;
        this.crewmateTimeInVent = settings.crewmateTimeInVent ?? this.crewmateTimeInVent;

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
        const sreader = reader.bytes(length);
        const version = sreader.uint8();

        if (version >= 7) {
            const [ , mreader ] = sreader.message();
            this.gameMode = mreader.uint8();

            if (this.gameMode === GameMode.None)
                return;

            this.maxPlayers = mreader.uint8();
            this.keywords = mreader.uint32();
            this.map = mreader.uint8();
            this.playerSpeed = mreader.float();
            this.crewmateVision = mreader.float();
            this.impostorVision = mreader.float();

            if (this.gameMode === GameMode.Normal) this.killCooldown = mreader.float();

            this.commonTasks = mreader.uint8();
            this.longTasks = mreader.uint8();
            this.shortTasks = mreader.uint8();

            if (this.gameMode === GameMode.HideNSeek) {
                this.isDefaults = mreader.bool();
                this.crewmateVentUses = mreader.int32();
                this.hidingTime = mreader.float();
                this.crewmateFlashlightSize = mreader.float();
                this.impostorFlashlightSize = mreader.float();
                this.useFlashlight = mreader.bool();
                this.finalHideSeekMap = mreader.bool();
                this.finalHideTime = mreader.float();
                this.finalSeekerSpeed = mreader.float();
                this.finalHidePing = mreader.bool();
                this.showNames = mreader.bool();
                this.seekerPlayerId = mreader.uint32();
                this.maxPingTime = mreader.float();
                this.crewmateTimeInVent = mreader.float();
            } else {
                this.numEmergencies = mreader.int32();
                this.numImpostors = mreader.uint8();
                this.killDistance = mreader.uint8();
                this.discussionTime = mreader.int32();
                this.votingTime = mreader.int32();
                this.isDefaults = mreader.bool();
                this.emergencyCooldown = mreader.uint8();
                this.confirmEjects = mreader.bool();
                this.visualTasks = mreader.bool();
                this.anonymousVotes = mreader.bool();
                this.taskbarUpdates = mreader.uint8();

                this.roleSettings.Deserialize(mreader, version);
            }
        } else {
            this.maxPlayers = sreader.uint8();
            this.keywords = sreader.uint32();
            this.map = sreader.uint8();
            this.playerSpeed = sreader.float();
            this.crewmateVision = sreader.float();
            this.impostorVision = sreader.float();
            this.killCooldown = sreader.float();
            this.commonTasks = sreader.uint8();
            this.longTasks = sreader.uint8();
            this.shortTasks = sreader.uint8();
            this.numEmergencies = sreader.uint32();
            this.numImpostors = sreader.uint8();
            this.killDistance = sreader.uint8();
            this.discussionTime = sreader.uint32();
            this.votingTime = sreader.uint32();
            this.isDefaults = sreader.bool();

            if (version >= 2) {
                this.emergencyCooldown = sreader.uint8();
                if (version >= 3) {
                    this.confirmEjects = sreader.bool();
                    this.visualTasks = sreader.bool();
                    if (version >= 4) {
                        this.anonymousVotes = sreader.bool();
                        this.taskbarUpdates = sreader.uint8();
                        if (version >= 5) {
                            this.roleSettings.Deserialize(sreader, version);
                        }
                    }
                }
            }
        }
    }

    Serialize(writer: HazelWriter, version: number) {
        if (version >= 7) {
            const owriter = HazelWriter.alloc(256);
            owriter.uint8(version);
            owriter.begin(0);
            owriter.uint8(this.gameMode);

            if (this.gameMode === GameMode.None)
                return;

            owriter.uint8(this.maxPlayers);
            owriter.uint32(this.keywords);
            owriter.uint8(this.map);
            owriter.float(this.playerSpeed);
            owriter.float(this.crewmateVision);
            owriter.float(this.impostorVision);

            if (this.gameMode === GameMode.Normal) owriter.float(this.killCooldown);

            owriter.uint8(this.commonTasks);
            owriter.uint8(this.longTasks);
            owriter.uint8(this.shortTasks);

            if (this.gameMode === GameMode.HideNSeek) {
                owriter.bool(this.isDefaults);
                owriter.int32(this.crewmateVentUses);
                owriter.float(this.hidingTime);
                owriter.float(this.crewmateFlashlightSize);
                owriter.float(this.impostorFlashlightSize);
                owriter.bool(this.useFlashlight);
                owriter.bool(this.finalHideSeekMap);
                owriter.float(this.finalHideTime);
                owriter.float(this.finalSeekerSpeed);
                owriter.bool(this.finalHidePing);
                owriter.bool(this.showNames);
                owriter.uint32(this.seekerPlayerId);
                owriter.float(this.maxPingTime);
                owriter.float(this.crewmateTimeInVent);
            } else {
                owriter.int32(this.numEmergencies);
                owriter.uint8(this.numImpostors);
                owriter.uint8(this.killDistance);
                owriter.int32(this.discussionTime);
                owriter.int32(this.votingTime);
                owriter.bool(this.isDefaults);
                owriter.uint8(this.emergencyCooldown);
                owriter.bool(this.confirmEjects);
                owriter.bool(this.visualTasks);
                owriter.bool(this.anonymousVotes);
                owriter.uint8(this.taskbarUpdates);

                owriter.write(this.roleSettings, version);
            }
            owriter.end();
            owriter.realloc(owriter.cursor);
            writer.upacked(owriter.size);
            writer.bytes(owriter);
        } else {
            const owriter = HazelWriter.alloc(128);
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
                            owriter.write(this.roleSettings, version);
                        }
                    }
                }
            }
            owriter.realloc(owriter.cursor);
            writer.upacked(owriter.size);
            writer.bytes(owriter);
        }
    }

    clone() {
        return new GameSettings(this);
    }
}
