import { HostableOptions } from "@skeldjs/core";

export interface ClientConfig extends HostableOptions {
    /**
     * Whether or not to allow host actions to take place.
     */
    allowHost?: boolean;
}
