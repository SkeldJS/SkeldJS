import { DisconnectReason } from "@skeldjs/constant";

export const DisconnectMessages = {
    [DisconnectReason.ServerFull]: "The Among Us servers are overloaded.\r\n\r\nSorry! Please try again later!",
    [DisconnectReason.IntentionalLeaving]: "You may not join another game for another X minutes after intentionally disconnecting.",
    [DisconnectReason.FocusLostBackground]: "You were disconnected because Among Us was suspended by another app.",
    [DisconnectReason.Kicked]: "You were kicked from the room.\r\n\r\nYou can rejoin if the room hasn't started.",
    [DisconnectReason.Banned]: "You were banned from the room.\r\n\r\nYou cannot rejoin that room.",
    [DisconnectReason.Hacking]: "You were banned for hacking.\r\n\r\nPlease stop.",
    [DisconnectReason.GameFull]: "The game you tried to join is full.\r\n\r\nCheck with the host to see if you can join next round.",
    [DisconnectReason.GameStarted]: "The game you tried to join already started.\r\n\r\nCheck with the host to see if you can join next round.",
    [DisconnectReason.GameNotFound]: "Could not find the game you're looking for.",
    [DisconnectReason.LobbyInactivity]: "The server closed the room due to inactivity",
    [DisconnectReason.Error]: "You disconnected from the server.\r\nIf this happens often, check your network strength.\r\nThis may also be a server issue.",
    [DisconnectReason.InvalidName]: "Game server refused username",
    [DisconnectReason.IncorrectGame]: "An unknown error disconnected you from the server.",
    [DisconnectReason.IncorrectVersion]: "You are running an older version of the game.\r\n\r\nPlease update to play with others.",
    [DisconnectReason.NotAuthorized]: "The Among Us servers could not authenticate you.\r\n\nYou must have an Among Us account to play online. (Guest account is okay!)",
    [DisconnectReason.PlatformLock]: "The creator of this room has locked it to their platform",
    [DisconnectReason.MatchmakerInactivity]: "The server disconnected you due to inactivity",
    [DisconnectReason.InvalidGameOptions]: "The game options received were invalid. You may need to clear all save data and restart the game.",
    [DisconnectReason.NoServersAvailable]: "No servers are available. Sorry! Try again later.",
    [DisconnectReason.QuickmatchDisabled]: "QuickMatch is currently unavailable. Please try joining a game instead.",
    [DisconnectReason.TooManyGames]: "There are too many games. Please try joining a game instead.",
    [DisconnectReason.PlatformParentalControlsBlock]: "Your parental controls, or the parental controls of the players you are attempting to join do not allow you to play together.",
    [DisconnectReason.QuickchatLock]: "Incorrect chat mode.",
    [DisconnectReason.PlatformUserBlock]: "Unable to join: Lobby contains user on block list or user blocking you. Please try another.",
    [DisconnectReason.SelfPlatformLock]: "The room you joined is crossplatform, but you have disabled crossplatform in your local settings"
} as Record<number, string>;
