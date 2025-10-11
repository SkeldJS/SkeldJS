import { ReportOutcome, ReportReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection } from "../../PacketDecoder";

import { BaseRootMessage } from "./BaseRootMessage";

export class ReportPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.ReportPlayer as const;
    messageTag = RootMessageTag.ReportPlayer as const;

    gameId!: number;

    outcome!: ReportOutcome;
    name!: string;

    clientId: number;
    reason: ReportReason;

    constructor(code: number, clientId: number, reason: ReportReason);
    constructor(
        clientId: number,
        reason: ReportReason,
        outcome: ReportOutcome,
        name: string
    );
    constructor(
        gameId: number,
        clientId_reason: number,
        reason_outcome: number,
        name?: string
    ) {
        super();

        if (typeof name === "string") {
            this.clientId = gameId as number;
            this.reason = clientId_reason;
            this.outcome = reason_outcome;
            this.name = name;
        } else {
            this.gameId = gameId;
            this.clientId = clientId_reason;
            this.reason = reason_outcome;
        }
    }

    static deserializeFromReader(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const clientId = reader.packed();
            const reason = reader.uint32();
            const outcome = reader.uint8();
            const name = reader.string();

            return new ReportPlayerMessage(clientId, reason, outcome, name);
        } else {
            const code = reader.int32();
            const clientId = reader.packed();
            const reason = reader.uint8();

            return new ReportPlayerMessage(code, clientId, reason);
        }
    }

    serializeToWriter(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.packed(this.clientId);
            writer.uint32(this.reason);
            writer.uint8(this.outcome);
            writer.string(this.name);
        } else {
            writer.int32(this.gameId);
            writer.packed(this.clientId);
            writer.uint8(this.reason);
        }
    }

    clone() {
        if (this.gameId) {
            return new ReportPlayerMessage(this.gameId, this.clientId, this.reason);
        }

        return new ReportPlayerMessage(this.clientId, this.reason, this.outcome, this.name);
    }
}
