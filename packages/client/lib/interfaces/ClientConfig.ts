import { HostableConfig, Language, QuickChatMode } from "@skeldjs/core";
import { PlatformSpecificData } from "@skeldjs/protocol";
import { AuthMethod } from "./AuthMethod";

export interface ClientConfig extends HostableConfig {
    /**
     * Whether or not to allow host actions to take place.
     * @default true
     */
    allowHost: boolean;
    /**
     * How to authenticate with the server, if any.
     * @default AuthMethod.SecureTransport
     */
    authMethod: AuthMethod;
    /**
     * Whether or not to use a HTTP matchmaking server in order to authenticate, can be
     * disabled for private servers that don't have a HTTP matchmaking server running.
     * @default true
     */
    useHttpMatchmaker: boolean;
    /**
     * The client's language. Used to localise messages from the server.
     * @default Language.English
     */
    language: Language;
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
     * An id token recieved from the EOS http api.
     */
    idToken: string;
    /**
     * A Epic Online Services user ID to authenticate with the Among Us servers as.
     */
    eosProductUserId: string;
}
