import { DisconnectReason } from "@skeldjs/constant";

export const DisconnectMessages = {
    [DisconnectReason.None]:
        "Forcibly disconnected from server. The remote sent a disconnect request.",
    [DisconnectReason.GameFull]:
        "The game you tried to join is full. Check with the host to see if you can join next round.",
    [DisconnectReason.GameStarted]:
        "The game you tried to join already started. Check with the host to see if you can join next round.",
    [DisconnectReason.GameNotFound]:
        "Could not find the game you're looking for.",
    [DisconnectReason.IncorrectVersion]:
        "You are running an older version of the game. Please update to play with others.",
    [DisconnectReason.Banned]:
        "You were banned from the room. You cannot rejoin that room.",
    [DisconnectReason.Kicked]:
        "You were kicked from the room. You can rejoin if the room hasn't started.",
    [DisconnectReason.InvalidName]: "Server refused username",
    [DisconnectReason.Hacking]: "You were banned for hacking. Please stop.",
    [DisconnectReason.Error]:
        "You disconnected from the host. If this happens often, check your WiFi strength.",
    [DisconnectReason.IncorrectGame]:
        "Could not find the game you're looking for.",
    [DisconnectReason.ServerRequest]:
        "The server stopped this game. Possibly due to inactivity.",
    [DisconnectReason.ServerFull]:
        "The Among Us servers are overloaded. Sorry! Please try again later!",
} as Record<number, string>;
