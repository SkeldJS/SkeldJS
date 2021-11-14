import { GameKeyword, HostableOptions, QuickChatMode } from "@skeldjs/core";
import { PlatformSpecificData } from "@skeldjs/protocol";
import { AuthMethod } from "./AuthMethod";

export interface ClientConfig extends HostableOptions {
    /**
     * Whether or not to allow host actions to take place.
     * @default true
     */
    allowHost: boolean;
    /**
     * How to authenticate with the server, if any.
     * @default AuthStyle.Dtls
     */
    authMethod: AuthMethod;
    /**
     * The client's language. Used to localise messages from the server.
     * @default GameKeyword.English
     */
    language: GameKeyword;
    /**
     * The quick chat mode for the client. The server prevents you from joining
     * rooms with a quick chat mode if the client has free chat enbled.
     * @default QuickChatMode.FreeChat
     */
    chatMode: QuickChatMode;
    /**
     * Whether to make sure messages received from the server are handled in the
     * correct order.
     * @default false
     */
    messageOrdering: boolean;
    /**
     * The platform to register the SkeldJS client as being on.
     */
    platform: PlatformSpecificData;
    /**
     * A Epic Online Services user ID to authenticate with the Among Us servers as.
     * This is just a random 32 character string if not set, but you can use your
     * own account ID from Among Us if you wish to associate this SkeldJS client with
     * your account.
     */
    eosProductUserId: string;
}
