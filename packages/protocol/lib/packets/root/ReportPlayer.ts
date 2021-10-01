import { ReportOutcome, ReportReason, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection } from "../../PacketDecoder";

import { BaseRootMessage } from "./BaseRootMessage";

export class ReportPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.ReportPlayer as const;
    messageTag = RootMessageTag.ReportPlayer as const;

    code!: number;

    outcome!: ReportOutcome;
    name!: string;

    clientid: number;
    reason: ReportReason;

    constructor(code: string | number, clientid: number, reason: ReportReason);
    constructor(
        clientid: number,
        reason: ReportReason,
        outcome: ReportOutcome,
        name: string
    );
    constructor(
        code: string | number,
        clientid_reason: number,
        reason_outcome: number,
        name?: string
    ) {
        super();

        if (typeof name === "string") {
            this.clientid = code as number;
            this.reason = clientid_reason;
            this.outcome = reason_outcome;
            this.name = name;
        } else {
            if (typeof code === "string") {
                this.code = Code2Int(code);
            } else {
                this.code = code;
            }

            this.clientid = clientid_reason;
            this.reason = reason_outcome;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const clientid = reader.packed();
            const reason = reader.uint32();
            const outcome = reader.uint8();
            const name = reader.string();

            return new ReportPlayerMessage(clientid, reason, outcome, name);
        } else {
            const code = reader.int32();
            const clientid = reader.packed();
            const reason = reader.uint8();

            return new ReportPlayerMessage(code, clientid, reason);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.packed(this.clientid);
            writer.uint32(this.reason);
            writer.uint8(this.outcome);
            writer.string(this.name);
        } else {
            writer.int32(this.code);
            writer.packed(this.clientid);
            writer.uint8(this.reason);
        }
    }

    clone() {
        if (this.code) {
            return new ReportPlayerMessage(this.code, this.clientid, this.reason);
        }

        return new ReportPlayerMessage(this.clientid, this.reason, this.outcome, this.name);
    }
}
