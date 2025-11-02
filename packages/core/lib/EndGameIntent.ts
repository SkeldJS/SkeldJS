import { GameOverReason } from "@skeldjs/au-constants";
import { StatefulRoom } from "./StatefulRoom";
import { Player } from "./Player";
import { SabotagableSystem } from "./systems";

/**
 * Represents an intent to end the current game, can be used with {@link StatefulRoom.registerEndGameIntent}.
 */
export class EndGameIntent {
    constructor(
        public readonly reason: GameOverReason
    ) { }
}

export class CrewmatesByVoteEndGameIntent<RoomType extends StatefulRoom> extends EndGameIntent {
    constructor(
        public readonly playerVotedOut: Player<RoomType>,
    ) {
        super(GameOverReason.CrewmatesByVote);
    }
}

export class CrewmatesByTaskEndGameIntent<RoomType extends StatefulRoom> extends EndGameIntent {
    constructor(
        public readonly lastPlayer: Player<RoomType>,
        public readonly taskIdx: number,
    ) {
        super(GameOverReason.CrewmatesByTask);
    }
}

export class ImpostorByVoteEndGameIntent<RoomType extends StatefulRoom> extends EndGameIntent {
    constructor(
        public readonly playerVotedOut: Player<RoomType>,
    ) {
        super(GameOverReason.ImpostorByVote);
    }
}

export class ImpostorByKillEndGameIntent<RoomType extends StatefulRoom> extends EndGameIntent {
    constructor(
        public readonly playerKiller: Player<RoomType>,
        public readonly playerVictim: Player<RoomType>
    ) {
        super(GameOverReason.ImpostorByKill);
    }
}

export class ImpostorBySabotageEndGameIntent<RoomType extends StatefulRoom> extends EndGameIntent {
    constructor(public readonly sabotagedSystem: SabotagableSystem<RoomType>) {
        super(GameOverReason.ImpostorBySabotage);
    }
}

export class ImpostorDisconnectEndGameIntent<RoomType extends StatefulRoom> extends EndGameIntent {
    constructor(public readonly lastPlayer: Player<RoomType>) {
        super(GameOverReason.ImpostorDisconnect);
    }
}

export class CrewmateDisconnectEndGameIntent<RoomType extends StatefulRoom> extends EndGameIntent {
    constructor(public readonly lastPlayer: Player<RoomType>) {
        super(GameOverReason.CrewmateDisconnect);
    }
}
