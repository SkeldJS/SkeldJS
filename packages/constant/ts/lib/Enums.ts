export enum ColorID {
    Red = 0,
    Blue = 1,
    DarkGreen = 2,
    Pink = 3,
    Orange = 4,
    Yellow = 5,
    Black = 6,
    White = 7,
    Purple = 8,
    Brown = 9,
    Cyan = 10,
    Lime = 11
}

export enum DisconnectReason {
    None = 0,
    GameFull = 1,
    GameStarted = 2,
    GameNotFound = 3,
    IncorrectVersion = 5,
    Banned = 6,
    Kicked = 7,
    Custom = 8,
    InvalidName = 9,
    Hacking = 10,
    Destroy = 16,
    Error = 17,
    IncorrectGame = 18,
    ServerRequest = 19,
    ServerFull = 20,
    FocusLostBackground = 207,
    IntentionalLeaving = 208,
    FocusLost = 209,
    NewConnection = 210
}

export enum DistanceID {
    Short = 0,
    Medium = 1,
    Long = 2
}

export enum TaskBarUpdate {
    Always = 0,
    InMeetings = 1,
    Never = 2
}

export enum MessageID {
    Data = 1,
    RPC = 2,
    Spawn = 4,
    Despawn = 5,
    SceneChange = 6,
    Ready = 7,
    ChangeSettings = 8
}

export enum HatID {
    NoHat = 0,
    Astronaut = 1,
    BaseballCap = 2,
    BrainSlug = 3,
    BushHat = 4,
    CaptainsHat = 5,
    DoubleTopHat = 6,
    Flowerpot = 7,
    Goggles = 8,
    HardHat = 9,
    Military = 10,
    PaperHat = 11,
    PartyHat = 12,
    Police = 13,
    Stethescope = 14,
    TopHat = 15,
    TowelWizard = 16,
    Ushanka = 17,
    Viking = 18,
    WallCap = 19,
    Snowman = 20,
    Reindeer = 21,
    Lights = 22,
    Santa = 23,
    Tree = 24,
    Present = 25,
    Candycanes = 26,
    ElfHat = 27,
    NewYears2018 = 28,
    WhiteHat = 29,
    Crown = 30,
    Eyebrows = 31,
    HaloHat = 32,
    HeroCap = 33,
    PipCap = 34,
    PlungerHat = 35,
    ScubaHat = 36,
    StickminHat = 37,
    StrawHat = 38,
    TenGallonHat = 39,
    ThirdEyeHat = 40,
    ToiletPaperHat = 41,
    Toppat = 42,
    Fedora = 43,
    Goggles_2 = 44,
    Headphones = 45,
    MaskHat = 46,
    PaperMask = 47,
    Security = 48,
    StrapHat = 49,
    Banana = 50,
    Beanie = 51,
    Bear = 52,
    Cheese = 53,
    Cherry = 54,
    Egg = 55,
    Fedora_2 = 56,
    Flamingo = 57,
    FlowerPin = 58,
    Helmet = 59,
    Plant = 60,
    BatEyes = 61,
    BatWings = 62,
    Horns = 63,
    Mohawk = 64,
    Pumpkin = 65,
    ScaryBag = 66,
    Witch = 67,
    Wolf = 68,
    Pirate = 69,
    Plague = 70,
    Machete = 71,
    Fred = 72,
    MinerCap = 73,
    WinterHat = 74,
    Archae = 75,
    Antenna = 76,
    Balloon = 77,
    BirdNest = 78,
    BlackBelt = 79,
    Caution = 80,
    Chef = 81,
    CopHat = 82,
    DoRag = 83,
    DumSticker = 84,
    Fez = 85,
    GeneralHat = 86,
    GreyThing = 87,
    HunterCap = 88,
    JungleHat = 89,
    MiniCrewmate = 90,
    NinjaMask = 91,
    RamHorns = 92,
    Snowman_2 = 93
}

export enum LanguageID {
    Any = 0,
    Other = 1,
    English = 160,
    Spanish = 2,
    Korean = 4,
    Russian = 8,
    Portuguese = 16,
    Arabic = 32,
    Filipino = 64,
    Polish = 128
}

export enum SystemType {
    Hallway = 0,
    Storage = 1,
    Cafeteria = 2,
    Reactor = 3,
    UpperEngine = 4,
    Navigations = 5,
    Administrator = 6,
    Electrical = 7,
    O2 = 8,
    Shields = 9,
    MedBay = 10,
    Security = 11,
    Weapons = 12,
    LowerEngine = 13,
    Communications = 14,
    ShipTasks = 15,
    Doors = 16,
    Sabotage = 17,
    Decontamination = 18,
    Launchpad = 19,
    LockerRoom = 20,
    Laboratory = 21,
    Balcony = 22,
    Office = 23,
    Greenhouse = 24,
    Dropship = 25,
    Decontamination2 = 26,
    Outside = 27,
    Specimens = 28,
    BoilerRoom = 29
}

export enum MapDoors {
    TheSkeld = 13,
    MiraHQ = 0,
    Polus = 12
}

export enum MapID {
    TheSkeld = 0,
    MiraHQ = 1,
    Polus = 2,
    Airship = 4
}

export enum Opcode {
    Unreliable = 0,
    Reliable = 1,
    Hello = 8,
    Disconnect = 9,
    Acknowledge = 10,
    Ping = 12
}

export enum PayloadTag {
    HostGame = 0,
    JoinGame = 1,
    StartGame = 2,
    RemoveGame = 3,
    RemovePlayer = 4,
    GameData = 5,
    GameDataTo = 6,
    JoinedGame = 7,
    EndGame = 8,
    GetGameList = 9,
    AlterGame = 10,
    KickPlayer = 11,
    WaitForHost = 12,
    Redirect = 13,
    MasterServerList = 14,
    GetGameListV2 = 16
}

export enum RpcID {
    PlayAnimation = 0,
    CompleteTask = 1,
    SyncSettings = 2,
    SetInfected = 3,
    Exiled = 4,
    CheckName = 5,
    SetName = 6,
    CheckColor = 7,
    SetColor = 8,
    SetHat = 9,
    SetSkin = 10,
    ReportDeadBody = 11,
    MurderPlayer = 12,
    SendChat = 13,
    StartMeeting = 14,
    SetScanner = 15,
    SendChatNote = 16,
    SetPet = 17,
    SetStartCounter = 18,
    EnterVent = 19,
    ExitVent = 20,
    SnapTo = 21,
    Close = 22,
    VotingComplete = 23,
    CastVote = 24,
    ClearVote = 25,
    AddVote = 26,
    CloseDoorsOfType = 27,
    RepairSystem = 28,
    SetTasks = 29,
    UpdateGameData = 30
}

export enum DataID {
    Movement = 6
}

export enum PetID {
    None = 0,
    Alien = 1,
    Crewmate = 2,
    Doggy = 3,
    Stickmin = 4,
    Hamster = 5,
    Robot = 6,
    UFO = 7,
    Ellie = 8,
    Squig = 9,
    Bedcrab = 10
}

export enum SkinID {
    None = 0,
    Astro = 1,
    Capt = 2,
    Mech = 3,
    Military = 4,
    Police = 5,
    Science = 6,
    SuitB = 7,
    SuitW = 8,
    Wall = 9,
    Hazmat = 10,
    Security = 11,
    Tarmac = 12,
    Miner = 13,
    Winter = 14,
    Archae = 15
}

export enum SpawnID {
    ShipStatus = 0,
    MeetingHud = 1,
    LobbyBehaviour = 2,
    GameData = 3,
    Player = 4,
    Headquarters = 5,
    PlanetMap = 6,
    AprilShipStatus = 7,
    Airship = 8
}

export enum SpawnFlag {
    None = 0,
    IsClient = 1
}

export enum TaskID {
    SubmitScan = 0,
    PrimeShields = 1,
    FuelEngines = 2,
    CharCourse = 3,
    StartReactor = 4,
    SwipeCard = 5,
    ClearAsteroids = 6,
    UploadData = 7,
    InspectSample = 8,
    EmptyChute = 9,
    EmptyGarbage = 10,
    AlignEngineOutput = 11,
    FixWiring = 12,
    CalibrateDistributor = 13,
    DivertPower = 14,
    UnlockManifolds = 15,
    ResetReactor = 16,
    FixLights = 17,
    CleanO2Filter = 18,
    FixCommucations = 19,
    RestoreOxygen = 20,
    StablizeSteering = 21,
    AssembleArtifact = 22,
    SortSamples = 23,
    MeasureWeather = 24,
    EnterIdCode = 25,
    BuyBerverage = 26,
    ProcessData = 27,
    RunDiagnostics = 28,
    WaterPlants = 29,
    MonitorOxygen = 30,
    StoreArtifacts = 31,
    FillCanisters = 32,
    ActivateWeatherNodes = 33,
    InsertKeys = 34,
    ResetSeismic = 35,
    ScanBoardingPass = 36,
    OpenWaterways = 37,
    ReplaceWaterJug = 38,
    RepairDrill = 39,
    AlignTelescope = 40,
    RecordTemperature = 41,
    RebootWifi = 42
}

export enum GameEndReason {
    HumansByVote = 0,
    HumansByTask = 1,
    ImpostorByVote = 2,
    ImpostorByKill = 3,
    ImpostorBySabotage = 4,
    ImpostorDisconnect = 5,
    HumansDisconnect = 6
}

export enum AlterGameTag {
    ChangePrivacy = 1
}

export enum TheSkeldVent {
    Admin,
    RightHallway,
    Cafeteria,
    Electrical,
    UpperEngine,
    Security,
    MedBay,
    Weapons,
    LowerReactor,
    LowerEngine,
    Shields,
    UpperReactor,
    UpperNavigation,
    LowerNavigation
}

export enum MiraHQVent {
    Balcony = 1,
    Cafeteria,
    Reactor,
    Labatory,
    Office,
    Admin,
    Greenhouse,
    MedBay,
    Decontamination,
    LockerRoom,
    Launchpad
}

export enum PolusVent {
    Security,
    Electrical,
    O2,
    Communications,
    Office,
    Admin,
    Labatory,
    LavaPool,
    Storage,
    RightSeismic,
    LeftSeismic,
    OutsideAdmin
}