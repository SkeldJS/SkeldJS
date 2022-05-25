import { ReportOutcome, ReportReason, RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection } from "../../PacketDecoder";

import { BaseRootMessage } from "./BaseRootMessage";

export class ReportPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.ReportPlayer as const;
    messageTag = RootMessageTag.ReportPlayer as const;

    code!: number;

    outcome!: ReportOutcome;
    name!: string;

    clientId: number;
    reason: ReportReason;

    constructor(code: string | number, clientId: number, reason: ReportReason);
    constructor(
        clientId: number,
        reason: ReportReason,
        outcome: ReportOutcome,
        name: string
    );
    constructor(
        code: string | number,
        clientId_reason: number,
        reason_outcome: number,
        name?: string
    ) {
        super();

        if (typeof name === "string") {
            this.clientId = code as number;
            this.reason = clientId_reason;
            this.outcome = reason_outcome;
            this.name = name;
        } else {
            if (typeof code === "string") {
                this.code = GameCode.convertStringToInt(code);
            } else {
                this.code = code;
            }

            this.clientId = clientId_reason;
            this.reason = reason_outcome;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
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

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.packed(this.clientId);
            writer.uint32(this.reason);
            writer.uint8(this.outcome);
            writer.string(this.name);
        } else {
            writer.int32(this.code);
            writer.packed(this.clientId);
            writer.uint8(this.reason);
        }
    }

    clone() {
        if (this.code) {
            return new ReportPlayerMessage(this.code, this.clientId, this.reason);
        }

        return new ReportPlayerMessage(this.clientId, this.reason, this.outcome, this.name);
    }
}
