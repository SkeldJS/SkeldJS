import { ReportOutcome, ReportReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class S2CReportPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.ReportPlayer;

    constructor(
        public readonly clientId: number,
        public readonly reason: ReportReason,
        public readonly outcome: ReportOutcome,
        public readonly name: string
    ) {
        super(S2CReportPlayerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const clientId = reader.packed();
        const reason = reader.uint32();
        const outcome = reader.uint8();
        const name = reader.string();

        return new S2CReportPlayerMessage(clientId, reason, outcome, name);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.clientId);
        writer.uint32(this.reason);
        writer.uint8(this.outcome);
        writer.string(this.name);
    }

    clone() {
        return new S2CReportPlayerMessage(this.clientId, this.reason, this.outcome, this.name);
    }
}


export class C2SReportPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.ReportPlayer;

    constructor(
        public readonly gameId: number,
        public readonly clientId: number,
        public readonly reason: ReportReason,
    ) {
        super(C2SReportPlayerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const gameId = reader.int32();
        const clientId = reader.packed();
        const reason = reader.uint8();

        return new C2SReportPlayerMessage(gameId, clientId, reason);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.packed(this.clientId);
        writer.uint8(this.reason);
    }

    clone() {
        return new C2SReportPlayerMessage(this.gameId, this.clientId, this.reason);
    }
}
