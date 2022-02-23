export interface PacketDecoderConfig {
    /**
     * Whether or not to use the DTLS layout when parsing the Hello packet.
     * @default false
     */
    useDtlsLayout: boolean;
    /**
     * Whether or not to write root messages that aren't defined for the decoder.
     * @default false
     */
    writeUnknownRootMessages: boolean;
    /**
     * Whether or not to write game data messages that aren't defined for the
     * decoder.
     * @default false
     */
    writeUnknownGameData: boolean;
}
