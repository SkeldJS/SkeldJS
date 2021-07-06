import { HazelReader, HazelWriter } from "@skeldjs/util";
import crypto from "crypto";
import { ECCurveType } from "./enums/ECCurveType";
import { HashAlgorithm } from "./enums/HashAlgorithm";
import { NamedCurve } from "./enums/NamedCurve";
import { SignatureAlgorithm } from "./enums/SignatureAlgorithm";
import { uint24 } from "./types/uint24";

const x25519KeySize = 32;

class FieldElement {
    constructor(
        public x0: bigint,
        public x1: bigint,
        public x2: bigint,
        public x3: bigint,
        public x4: bigint,
        public x5: bigint,
        public x6: bigint,
        public x7: bigint,
        public x8: bigint,
        public x9: bigint
    ) {}

    static Zero() {
        return new FieldElement(
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0)
        );
    }

    static One() {
        const result = this.Zero();
        result.x0 = BigInt(1);
        return result;
    }

    static fromBytes(bytes: Buffer) {
        const reader = HazelReader.from(bytes);

        let tmp0 = BigInt(reader.uint32());
        let tmp1 = BigInt(reader.read(uint24)) << BigInt(6);
        let tmp2 = BigInt(reader.read(uint24)) << BigInt(5);
        let tmp3 = BigInt(reader.read(uint24)) << BigInt(3);
        let tmp4 = BigInt(reader.read(uint24)) << BigInt(2);
        let tmp5 = BigInt(reader.uint32());
        let tmp6 = BigInt(reader.read(uint24)) << BigInt(7);
        let tmp7 = BigInt(reader.read(uint24)) << BigInt(5);
        let tmp8 = BigInt(reader.read(uint24)) << BigInt(4);
        let tmp9 = BigInt((reader.read(uint24) & 0x007fffff)) << BigInt(2);

        const carry9 = (tmp9 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        tmp0 += carry9 * BigInt(19);
        tmp9 -= carry9 << BigInt(25);

        const carry1 = (tmp1 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        tmp2 += carry1;
        tmp1 -= carry1 << BigInt(25);

        const carry3 = (tmp3 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        tmp4 += carry3;
        tmp3 -= carry3 << BigInt(25);

        const carry5 = (tmp5 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        tmp6 += carry5;
        tmp5 -= carry5 << BigInt(25);

        const carry7 = (tmp7 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        tmp8 += carry7;
        tmp7 -= carry7 << BigInt(25);

        const carry0 = (tmp0 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        tmp1 += carry0;
        tmp0 -= carry0 << BigInt(26);

        const carry2 = (tmp2 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        tmp3 += carry2;
        tmp2 -= carry2 << BigInt(26);

        const carry4 = (tmp4 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        tmp5 += carry4;
        tmp4 -= carry4 << BigInt(26);

        const carry6 = (tmp6 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        tmp7 += carry6;
        tmp6 -= carry6 << BigInt(26);

        const carry8 = (tmp8 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        tmp9 += carry8;
        tmp8 -= carry8 << BigInt(26);

        return new FieldElement(
            tmp0,
            tmp1,
            tmp2,
            tmp3,
            tmp4,
            tmp5,
            tmp6,
            tmp7,
            tmp8,
            tmp9
        );
    }

    clone() {
        return new FieldElement(
            this.x0,
            this.x1,
            this.x2,
            this.x3,
            this.x4,
            this.x5,
            this.x6,
            this.x7,
            this.x8,
            this.x9
        );
    }

    copyTo(output: Buffer) {
        let q = (BigInt(19) * this.x9 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        q = (this.x0 + q) >> BigInt(26);
        q = (this.x1 + q) >> BigInt(25);
        q = (this.x2 + q) >> BigInt(26);
        q = (this.x3 + q) >> BigInt(25);
        q = (this.x4 + q) >> BigInt(26);
        q = (this.x5 + q) >> BigInt(25);
        q = (this.x6 + q) >> BigInt(26);
        q = (this.x7 + q) >> BigInt(25);
        q = (this.x8 + q) >> BigInt(26);
        q = (this.x9 + q) >> BigInt(25);

        this.x0 = (this.x0 + (BigInt(19) * q));

        const carry0 = this.x0 >> BigInt(26);
        this.x1 = this.x1 + carry0;
        this.x0 = this.x0 - (carry0 << BigInt(26));

        const carry1 = this.x1 >> BigInt(25);
        this.x2 = this.x2 + carry1;
        this.x1 = this.x1 - (carry1 << BigInt(25));

        const carry2 = this.x2 >> BigInt(26);
        this.x3 = this.x3 + carry2;
        this.x2 = this.x2 - (carry2 << BigInt(26));

        const carry3 = this.x3 >> BigInt(25);
        this.x4 = this.x4 + carry3;
        this.x3 = this.x3 - (carry3 << BigInt(25));

        const carry4 = this.x4 >> BigInt(26);
        this.x5 = this.x5 + carry4;
        this.x4 = this.x4 - (carry4 << BigInt(26));

        const carry5 = this.x5 >> BigInt(25);
        this.x6 = this.x6 + carry5;
        this.x5 = this.x5 - (carry5 << BigInt(25));

        const carry6 = this.x6 >> BigInt(26);
        this.x7 = this.x7 + carry6;
        this.x6 = this.x6 - (carry6 << BigInt(26));

        const carry7 = this.x7 >> BigInt(25);
        this.x8 = this.x8 + carry7;
        this.x7 = this.x7 - (carry7 << BigInt(25));

        const carry8 = this.x8 >> BigInt(26);
        this.x9 = this.x9 + carry8;
        this.x8 = this.x8 - (carry8 << BigInt(26));

        const carry9 = this.x9 >> BigInt(25);
        this.x9 = this.x9 - (carry9 << BigInt(25));

        output[0] = Number(this.x0 >> BigInt(0));
        output[1] = Number(this.x0 >> BigInt(8));
        output[2] = Number(this.x0 >> BigInt(16));
        output[3] = Number((this.x0 >> BigInt(24)) | (this.x1 << BigInt(2)));
        output[4] = Number(this.x1 >> BigInt(6));
        output[5] = Number(this.x1 >> BigInt(14));
        output[6] = Number((this.x1 >> BigInt(22)) | (this.x2 << BigInt(3)));
        output[7] = Number(this.x2 >> BigInt(5));
        output[8] = Number(this.x2 >> BigInt(13));
        output[9] = Number((this.x2 >> BigInt(21)) | (this.x3 << BigInt(5)));
        output[10] = Number(this.x3 >> BigInt(3));
        output[11] = Number(this.x3 >> BigInt(11));
        output[12] = Number((this.x3 >> BigInt(19)) | (this.x4 << BigInt(6)));
        output[13] = Number(this.x4 >> BigInt(2));
        output[14] = Number(this.x4 >> BigInt(10));
        output[15] = Number(this.x4 >> BigInt(18));
        output[16] = Number(this.x5 >> BigInt(0));
        output[17] = Number(this.x5 >> BigInt(8));
        output[18] = Number(this.x5 >> BigInt(16));
        output[19] = Number((this.x5 >> BigInt(24)) | (this.x6 << BigInt(1)));
        output[20] = Number(this.x6 >> BigInt(7));
        output[21] = Number(this.x6 >> BigInt(15));
        output[22] = Number((this.x6 >> BigInt(23)) | (this.x7 << BigInt(3)));
        output[23] = Number(this.x7 >> BigInt(5));
        output[24] = Number(this.x7 >> BigInt(13));
        output[25] = Number((this.x7 >> BigInt(21)) | (this.x8 << BigInt(4)));
        output[26] = Number(this.x8 >> BigInt(4));
        output[27] = Number(this.x8 >> BigInt(12));
        output[28] = Number((this.x8 >> BigInt(20)) | (this.x9 << BigInt(6)));
        output[29] = Number(this.x9 >> BigInt(2));
        output[30] = Number(this.x9 >> BigInt(10));
        output[31] = Number(this.x9 >> BigInt(18));
    }

    static add(output: FieldElement, a: FieldElement, b: FieldElement) {
        output.x0 = a.x0 + b.x0;
        output.x1 = a.x1 + b.x1;
        output.x2 = a.x2 + b.x2;
        output.x3 = a.x3 + b.x3;
        output.x4 = a.x4 + b.x4;
        output.x5 = a.x5 + b.x5;
        output.x6 = a.x6 + b.x6;
        output.x7 = a.x7 + b.x7;
        output.x8 = a.x8 + b.x8;
        output.x9 = a.x9 + b.x9;
    }

    static sub(output: FieldElement, a: FieldElement, b: FieldElement) {
        output.x0 = a.x0 - b.x0;
        output.x1 = a.x1 - b.x1;
        output.x2 = a.x2 - b.x2;
        output.x3 = a.x3 - b.x3;
        output.x4 = a.x4 - b.x4;
        output.x5 = a.x5 - b.x5;
        output.x6 = a.x6 - b.x6;
        output.x7 = a.x7 - b.x7;
        output.x8 = a.x8 - b.x8;
        output.x9 = a.x9 - b.x9;
    }

    static mul(output: FieldElement, a: FieldElement, b: FieldElement) {

        const b1_19 = BigInt(19) * b.x1;
        const b2_19 = BigInt(19) * b.x2;
        const b3_19 = BigInt(19) * b.x3;
        const b4_19 = BigInt(19) * b.x4;
        const b5_19 = BigInt(19) * b.x5;
        const b6_19 = BigInt(19) * b.x6;
        const b7_19 = BigInt(19) * b.x7;
        const b8_19 = BigInt(19) * b.x8;
        const b9_19 = BigInt(19) * b.x9;

        const a1_2 = BigInt(2) * a.x1;
        const a3_2 = BigInt(2) * a.x3;
        const a5_2 = BigInt(2) * a.x5;
        const a7_2 = BigInt(2) * a.x7;
        const a9_2 = BigInt(2) * a.x9;

        const a0b0 = a.x0 * b.x0;
        const a0b1 = a.x0 * b.x1;
        const a0b2 = a.x0 * b.x2;
        const a0b3 = a.x0 * b.x3;
        const a0b4 = a.x0 * b.x4;
        const a0b5 = a.x0 * b.x5;
        const a0b6 = a.x0 * b.x6;
        const a0b7 = a.x0 * b.x7;
        const a0b8 = a.x0 * b.x8;
        const a0b9 = a.x0 * b.x9;
        const a1b0 = a.x1 * b.x0;
        const a1b1_2 = a1_2 * b.x1;
        const a1b2 = a.x1 * b.x2;
        const a1b3_2 = a1_2 * b.x3;
        const a1b4 = a.x1 * b.x4;
        const a1b5_2 = a1_2 * b.x5;
        const a1b6 = a.x1 * b.x6;
        const a1b7_2 = a1_2 * b.x7;
        const a1b8 = a.x1 * b.x8;
        const a1b9_38 = a1_2 * b9_19;
        const a2b0 = a.x2 * b.x0;
        const a2b1 = a.x2 * b.x1;
        const a2b2 = a.x2 * b.x2;
        const a2b3 = a.x2 * b.x3;
        const a2b4 = a.x2 * b.x4;
        const a2b5 = a.x2 * b.x5;
        const a2b6 = a.x2 * b.x6;
        const a2b7 = a.x2 * b.x7;
        const a2b8_19 = a.x2 * b8_19;
        const a2b9_19 = a.x2 * b9_19;
        const a3b0 = a.x3 * b.x0;
        const a3b1_2 = a3_2 * b.x1;
        const a3b2 = a.x3 * b.x2;
        const a3b3_2 = a3_2 * b.x3;
        const a3b4 = a.x3 * b.x4;
        const a3b5_2 = a3_2 * b.x5;
        const a3b6 = a.x3 * b.x6;
        const a3b7_38 = a3_2 * b7_19;
        const a3b8_19 = a.x3 * b8_19;
        const a3b9_38 = a3_2 * b9_19;
        const a4b0 = a.x4 * b.x0;
        const a4b1 = a.x4 * b.x1;
        const a4b2 = a.x4 * b.x2;
        const a4b3 = a.x4 * b.x3;
        const a4b4 = a.x4 * b.x4;
        const a4b5 = a.x4 * b.x5;
        const a4b6_19 = a.x4 * b6_19;
        const a4b7_19 = a.x4 * b7_19;
        const a4b8_19 = a.x4 * b8_19;
        const a4b9_19 = a.x4 * b9_19;
        const a5b0 = a.x5 * b.x0;
        const a5b1_2 = a5_2 * b.x1;
        const a5b2 = a.x5 * b.x2;
        const a5b3_2 = a5_2 * b.x3;
        const a5b4 = a.x5 * b.x4;
        const a5b5_38 = a5_2 * b5_19;
        const a5b6_19 = a.x5 * b6_19;
        const a5b7_38 = a5_2 * b7_19;
        const a5b8_19 = a.x5 * b8_19;
        const a5b9_38 = a5_2 * b9_19;
        const a6b0 = a.x6 * b.x0;
        const a6b1 = a.x6 * b.x1;
        const a6b2 = a.x6 * b.x2;
        const a6b3 = a.x6 * b.x3;
        const a6b4_19 = a.x6 * b4_19;
        const a6b5_19 = a.x6 * b5_19;
        const a6b6_19 = a.x6 * b6_19;
        const a6b7_19 = a.x6 * b7_19;
        const a6b8_19 = a.x6 * b8_19;
        const a6b9_19 = a.x6 * b9_19;
        const a7b0 = a.x7 * b.x0;
        const a7b1_2 = a7_2 * b.x1;
        const a7b2 = a.x7 * b.x2;
        const a7b3_38 = a7_2 * b3_19;
        const a7b4_19 = a.x7 * b4_19;
        const a7b5_38 = a7_2 * b5_19;
        const a7b6_19 = a.x7 * b6_19;
        const a7b7_38 = a7_2 * b7_19;
        const a7b8_19 = a.x7 * b8_19;
        const a7b9_38 = a7_2 * b9_19;
        const a8b0 = a.x8 * b.x0;
        const a8b1 = a.x8 * b.x1;
        const a8b2_19 = a.x8 * b2_19;
        const a8b3_19 = a.x8 * b3_19;
        const a8b4_19 = a.x8 * b4_19;
        const a8b5_19 = a.x8 * b5_19;
        const a8b6_19 = a.x8 * b6_19;
        const a8b7_19 = a.x8 * b7_19;
        const a8b8_19 = a.x8 * b8_19;
        const a8b9_19 = a.x8 * b9_19;
        const a9b0 = a.x9 * b.x0;
        const a9b1_38 = a9_2 * b1_19;
        const a9b2_19 = a.x9 * b2_19;
        const a9b3_38 = a9_2 * b3_19;
        const a9b4_19 = a.x9 * b4_19;
        const a9b5_38 = a9_2 * b5_19;
        const a9b6_19 = a.x9 * b6_19;
        const a9b7_38 = a9_2 * b7_19;
        const a9b8_19 = a.x9 * b8_19;
        const a9b9_38 = a9_2 * b9_19;

        let h0 = a0b0 + a1b9_38 + a2b8_19 + a3b7_38 + a4b6_19 + a5b5_38 + a6b4_19 + a7b3_38 + a8b2_19 + a9b1_38;
        let h1 = a0b1 + a1b0 + a2b9_19 + a3b8_19 + a4b7_19 + a5b6_19 + a6b5_19 + a7b4_19 + a8b3_19 + a9b2_19;
        let h2 = a0b2 + a1b1_2 + a2b0 + a3b9_38 + a4b8_19 + a5b7_38 + a6b6_19 + a7b5_38 + a8b4_19 + a9b3_38;
        let h3 = a0b3 + a1b2 + a2b1 + a3b0 + a4b9_19 + a5b8_19 + a6b7_19 + a7b6_19 + a8b5_19 + a9b4_19;
        let h4 = a0b4 + a1b3_2 + a2b2 + a3b1_2 + a4b0 + a5b9_38 + a6b8_19 + a7b7_38 + a8b6_19 + a9b5_38;
        let h5 = a0b5 + a1b4 + a2b3 + a3b2 + a4b1 + a5b0 + a6b9_19 + a7b8_19 + a8b7_19 + a9b6_19;
        let h6 = a0b6 + a1b5_2 + a2b4 + a3b3_2 + a4b2 + a5b1_2 + a6b0 + a7b9_38 + a8b8_19 + a9b7_38;
        let h7 = a0b7 + a1b6 + a2b5 + a3b4 + a4b3 + a5b2 + a6b1 + a7b0 + a8b9_19 + a9b8_19;
        let h8 = a0b8 + a1b7_2 + a2b6 + a3b5_2 + a4b4 + a5b3_2 + a6b2 + a7b1_2 + a8b0 + a9b9_38;
        let h9 = a0b9 + a1b8 + a2b7 + a3b6 + a4b5 + a5b4 + a6b3 + a7b2 + a8b1 + a9b0;

        let carry0 = (h0 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h1 += carry0;
        h0 -= carry0 << BigInt(26);
        let carry4 = (h4 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h5 += carry4;
        h4 -= carry4 << BigInt(26);

        const carry1 = (h1 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h2 += carry1;
        h1 -= carry1 << BigInt(25);
        const carry5 = (h5 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h6 += carry5;
        h5 -= carry5 << BigInt(25);

        const carry2 = (h2 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h3 += carry2;
        h2 -= carry2 << BigInt(26);
        const carry6 = (h6 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h7 += carry6;
        h6 -= carry6 << BigInt(26);

        const carry3 = (h3 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h4 += carry3;
        h3 -= carry3 << BigInt(25);
        const carry7 = (h7 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h8 += carry7;
        h7 -= carry7 << BigInt(25);

        carry4 = (h4 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h5 += carry4;
        h4 -= carry4 << BigInt(26);
        const carry8 = (h8 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h9 += carry8;
        h8 -= carry8 << BigInt(26);

        const carry9 = (h9 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h0 += carry9 * BigInt(19);
        h9 -= carry9 << BigInt(25);

        carry0 = (h0 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h1 += carry0;
        h0 -= carry0 << BigInt(26);

        output.x0 = h0;
        output.x1 = h1;
        output.x2 = h2;
        output.x3 = h3;
        output.x4 = h4;
        output.x5 = h5;
        output.x6 = h6;
        output.x7 = h7;
        output.x8 = h8;
        output.x9 = h9;
    }

    static square(output: FieldElement, a: FieldElement) {
        const a0_2 = a.x0 * BigInt(2);
        const a1_2 = a.x1 * BigInt(2);
        const a2_2 = a.x2 * BigInt(2);
        const a3_2 = a.x3 * BigInt(2);
        const a4_2 = a.x4 * BigInt(2);
        const a5_2 = a.x5 * BigInt(2);
        const a6_2 = a.x6 * BigInt(2);
        const a7_2 = a.x7 * BigInt(2);

        const a5_38 = a.x5 * BigInt(38);
        const a6_19 = a.x6 * BigInt(19);
        const a7_38 = a.x7 * BigInt(38);
        const a8_19 = a.x8 * BigInt(19);
        const a9_38 = a.x9 * BigInt(38);

        const a0a0 = a.x0 * a.x0;
        const a0a1_2 = a0_2 * a.x1;
        const a0a2_2 = a0_2 * a.x2;
        const a0a3_2 = a0_2 * a.x3;
        const a0a4_2 = a0_2 * a.x4;
        const a0a5_2 = a0_2 * a.x5;
        const a0a6_2 = a0_2 * a.x6;
        const a0a7_2 = a0_2 * a.x7;
        const a0a8_2 = a0_2 * a.x8;
        const a0a9_2 = a0_2 * a.x9;
        const a1a1_2 = a1_2 * a.x1;
        const a1a2_2 = a1_2 * a.x2;
        const a1a3_4 = a1_2 * a3_2;
        const a1a4_2 = a1_2 * a.x4;
        const a1a5_4 = a1_2 * a5_2;
        const a1a6_2 = a1_2 * a.x6;
        const a1a7_4 = a1_2 * a7_2;
        const a1a8_2 = a1_2 * a.x8;
        const a1a9_76 = a1_2 * a9_38;
        const a2a2 = a.x2 * a.x2;
        const a2a3_2 = a2_2 * a.x3;
        const a2a4_2 = a2_2 * a.x4;
        const a2a5_2 = a2_2 * a.x5;
        const a2a6_2 = a2_2 * a.x6;
        const a2a7_2 = a2_2 * a.x7;
        const a2a8_38 = a2_2 * a8_19;
        const a2a9_38 = a.x2 * a9_38;
        const a3a3_2 = a3_2 * a.x3;
        const a3a4_2 = a3_2 * a.x4;
        const a3a5_4 = a3_2 * a5_2;
        const a3a6_2 = a3_2 * a.x6;
        const a3a7_76 = a3_2 * a7_38;
        const a3a8_38 = a3_2 * a8_19;
        const a3a9_76 = a3_2 * a9_38;
        const a4a4 = a.x4 * a.x4;
        const a4a5_2 = a4_2 * a.x5;
        const a4a6_38 = a4_2 * a6_19;
        const a4a7_38 = a.x4 * a7_38;
        const a4a8_38 = a4_2 * a8_19;
        const a4a9_38 = a.x4 * a9_38;
        const a5a5_38 = a.x5 * a5_38;
        const a5a6_38 = a5_2 * a6_19;
        const a5a7_76 = a5_2 * a7_38;
        const a5a8_38 = a5_2 * a8_19;
        const a5a9_76 = a5_2 * a9_38;
        const a6a6_19 = a.x6 * a6_19;
        const a6a7_38 = a.x6 * a7_38;
        const a6a8_38 = a6_2 * a8_19;
        const a6a9_38 = a.x6 * a9_38;
        const a7a7_38 = a.x7 * a7_38;
        const a7a8_38 = a7_2 * a8_19;
        const a7a9_76 = a7_2 * a9_38;
        const a8a8_19 = a.x8 * a8_19;
        const a8a9_38 = a.x8 * a9_38;
        const a9a9_38 = a.x9 * a9_38;

        let h0 = a0a0 + a1a9_76 + a2a8_38 + a3a7_76 + a4a6_38 + a5a5_38;
        let h1 = a0a1_2 + a2a9_38 + a3a8_38 + a4a7_38 + a5a6_38;
        let h2 = a0a2_2 + a1a1_2 + a3a9_76 + a4a8_38 + a5a7_76 + a6a6_19;
        let h3 = a0a3_2 + a1a2_2 + a4a9_38 + a5a8_38 + a6a7_38;
        let h4 = a0a4_2 + a1a3_4 + a2a2 + a5a9_76 + a6a8_38 + a7a7_38;
        let h5 = a0a5_2 + a1a4_2 + a2a3_2 + a6a9_38 + a7a8_38;
        let h6 = a0a6_2 + a1a5_4 + a2a4_2 + a3a3_2 + a7a9_76 + a8a8_19;
        let h7 = a0a7_2 + a1a6_2 + a2a5_2 + a3a4_2 + a8a9_38;
        let h8 = a0a8_2 + a1a7_4 + a2a6_2 + a3a5_4 + a4a4 + a9a9_38;
        let h9 = a0a9_2 + a1a8_2 + a2a7_2 + a3a6_2 + a4a5_2;

        let carry0 = (h0 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h1 += carry0;
        h0 -= carry0 << BigInt(26);
        let carry4 = (h4 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h5 += carry4;
        h4 -= carry4 << BigInt(26);

        const carry1 = (h1 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h2 += carry1;
        h1 -= carry1 << BigInt(25);
        const carry5 = (h5 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h6 += carry5;

        h5 -= carry5 << BigInt(25);

        const carry2 = (h2 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h3 += carry2;
        h2 -= carry2 << BigInt(26);
        const carry6 = (h6 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h7 += carry6;
        h6 -= carry6 << BigInt(26);

        const carry3 = (h3 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h4 += carry3;
        h3 -= carry3 << BigInt(25);
        const carry7 = (h7 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h8 += carry7;
        h7 -= carry7 << BigInt(25);

        carry4 = (h4 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h5 += carry4;
        h4 -= carry4 << BigInt(26);
        const carry8 = (h8 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h9 += carry8;
        h8 -= carry8 << BigInt(26);

        const carry9 = (h9 + (BigInt(1) << BigInt(24))) >> BigInt(25);
        h0 += carry9 * BigInt(19);
        h9 -= carry9 << BigInt(25);

        carry0 = (h0 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h1 += carry0;
        h0 -= carry0 << BigInt(26);

        output.x0 = h0;
        output.x1 = h1;
        output.x2 = h2;
        output.x3 = h3;
        output.x4 = h4;
        output.x5 = h5;
        output.x6 = h6;
        output.x7 = h7;
        output.x8 = h8;
        output.x9 = h9;
    }

    static mul121666(output: FieldElement, a: FieldElement) {
        let h0 = a.x0 * BigInt(121666);
        let h1 = a.x1 * BigInt(121666);
        let h2 = a.x2 * BigInt(121666);
        let h3 = a.x3 * BigInt(121666);
        let h4 = a.x4 * BigInt(121666);
        let h5 = a.x5 * BigInt(121666);
        let h6 = a.x6 * BigInt(121666);
        let h7 = a.x7 * BigInt(121666);
        let h8 = a.x8 * BigInt(121666);
        let h9 = a.x9 * BigInt(121666);

        const carry9 = (h9 + (BigInt(1)<<BigInt(24))) >> BigInt(25);
        h0 += carry9 * BigInt(19);
        h9 -= carry9 << BigInt(25);
        const carry1 = (h1 + (BigInt(1)<<BigInt(24))) >> BigInt(25);
        h2 += carry1;
        h1 -= carry1 << BigInt(25);
        const carry3 = (h3 + (BigInt(1)<<BigInt(24))) >> BigInt(25);
        h4 += carry3;
        h3 -= carry3 << BigInt(25);
        const carry5 = (h5 + (BigInt(1)<<BigInt(24))) >> BigInt(25);
        h6 += carry5;
        h5 -= carry5 << BigInt(25);
        const carry7 = (h7 + (BigInt(1)<<BigInt(24))) >> BigInt(25);
        h8 += carry7;
        h7 -= carry7 << BigInt(25);

        const carry0 = (h0 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h1 += carry0;
        h0 -= carry0 << BigInt(26);
        const carry2 = (h2 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h3 += carry2;
        h2 -= carry2 << BigInt(26);
        const carry4 = (h4 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h5 += carry4;
        h4 -= carry4 << BigInt(26);
        const carry6 = (h6 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h7 += carry6;
        h6 -= carry6 << BigInt(26);
        const carry8 = (h8 + (BigInt(1) << BigInt(25))) >> BigInt(26);
        h9 += carry8;
        h8 -= carry8 << BigInt(26);

        output.x0 = h0;
        output.x1 = h1;
        output.x2 = h2;
        output.x3 = h3;
        output.x4 = h4;
        output.x5 = h5;
        output.x6 = h6;
        output.x7 = h7;
        output.x8 = h8;
        output.x9 = h9;
    }

    static invert(output: FieldElement, a: FieldElement) {
        const t0 = FieldElement.Zero();
        this.square(t0, a);

        const t1 = FieldElement.Zero();
        this.square(t1, t0);
        this.square(t1, t1);

        const t2 = FieldElement.Zero();
        this.mul(t1, a, t1);
        this.mul(t0, t0, t1);
        this.square(t2, t0);
        //this.square(t2, t2);

        this.mul(t1, t1, t2);
        this.square(t2, t1);
        for (let i = 1; i < 5; ++i)
        {
            this.square(t2, t2);
        }

        this.mul(t1, t2, t1);
        this.square(t2, t1);
        for (let i = 1; i < 10; ++i)
        {
            this.square(t2, t2);
        }

        const t3 = FieldElement.Zero();
        this.mul(t2, t2, t1);
        this.square(t3, t2);
        for (let i = 1; i < 20; ++i)
        {
            this.square(t3, t3);
        }

        this.mul(t2, t3, t2);
        this.square(t2, t2);
        for (let i = 1; i < 10; ++i)
        {
            this.square(t2, t2);
        }

        this.mul(t1, t2, t1);
        this.square(t2, t1);
        for (let i = 1; i < 50; ++i)
        {
            this.square(t2, t2);
        }

        this.mul(t2, t2, t1);
        this.square(t3, t2);
        for (let i = 1; i < 100; ++i)
        {
            this.square(t3, t3);
        }

        this.mul(t2, t3, t2);
        this.square(t2, t2);
        for (let i = 1; i < 50; ++i)
        {
            this.square(t2, t2);
        }

        this.mul(t1, t2, t1);
        this.square(t1, t1);
        for (let i = 1; i < 5; ++i)
        {
            this.square(t1, t1);
        }

        this.mul(output, t1, t0);
    }

    static conditionalSwap(a: FieldElement, b: FieldElement, swap: number) {
        swap = -swap;

        const temp = new FieldElement(
            BigInt(swap) & (a.x0 ^ b.x0),
            BigInt(swap) & (a.x1 ^ b.x1),
            BigInt(swap) & (a.x2 ^ b.x2),
            BigInt(swap) & (a.x3 ^ b.x3),
            BigInt(swap) & (a.x4 ^ b.x4),
            BigInt(swap) & (a.x5 ^ b.x5),
            BigInt(swap) & (a.x6 ^ b.x6),
            BigInt(swap) & (a.x7 ^ b.x7),
            BigInt(swap) & (a.x8 ^ b.x8),
            BigInt(swap) & (a.x9 ^ b.x9),
        );

        a.x0 ^= temp.x0;
        a.x1 ^= temp.x1;
        a.x2 ^= temp.x2;
        a.x3 ^= temp.x3;
        a.x4 ^= temp.x4;
        a.x5 ^= temp.x5;
        a.x6 ^= temp.x6;
        a.x7 ^= temp.x7;
        a.x8 ^= temp.x8;
        a.x9 ^= temp.x9;

        b.x0 ^= temp.x0;
        b.x1 ^= temp.x1;
        b.x2 ^= temp.x2;
        b.x3 ^= temp.x3;
        b.x4 ^= temp.x4;
        b.x5 ^= temp.x5;
        b.x6 ^= temp.x6;
        b.x7 ^= temp.x7;
        b.x8 ^= temp.x8;
        b.x9 ^= temp.x9;
    }
}

export function x25519Func(output: Buffer, scalar: Buffer, point: Buffer) {
    const maskedScalar = Buffer.alloc(32);
    scalar.copy(maskedScalar);
    maskedScalar[0] &= 248;
    maskedScalar[31] &= 127;
    maskedScalar[31] |= 64;

    const x1 = FieldElement.fromBytes(point);
    const x2 = FieldElement.One();
    const x3 = x1.clone();
    const z2 = FieldElement.Zero();
    const z3 = FieldElement.One();

    const tmp0 = FieldElement.Zero();
    const tmp1 = FieldElement.Zero();

    let swap = 0;
    for (let pos = 254; pos >= 0; --pos) {
        let b = maskedScalar[Math.floor(pos / 8)] >> (pos % 8);
        b &= 1;
        swap ^= b;

        FieldElement.conditionalSwap(x2, x3, swap);
        FieldElement.conditionalSwap(z2, z3, swap);
        swap = b;

        FieldElement.sub(tmp0, x3, z3);
        FieldElement.sub(tmp1, x2, z2);
        FieldElement.add(x2, x2, z2);
        FieldElement.add(z2, x3, z3);
        FieldElement.mul(z3, tmp0, x2);
        FieldElement.mul(z2, z2, tmp1);
        FieldElement.square(tmp0, tmp1);
        FieldElement.square(tmp1, x2);
        FieldElement.add(x3, z3, z2);
        FieldElement.sub(z2, z3, z2);
        FieldElement.mul(x2, tmp1, tmp0);
        FieldElement.sub(tmp1, tmp1, tmp0);
        FieldElement.square(z2, z2);
        FieldElement.mul121666(z3, tmp1);
        FieldElement.square(x3, x3);
        FieldElement.add(tmp0, tmp0, z3);
        FieldElement.mul(z3, x1, z2);
        FieldElement.mul(z2, tmp1, tmp0);
    }

    FieldElement.conditionalSwap(x2, x3, swap);
    FieldElement.conditionalSwap(z2, z3, swap);

    FieldElement.invert(z2, z2);
    FieldElement.mul(x2, x2, z2);
    x2.copyTo(output);
}

const basePoint = Buffer.from([
    9, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
]);

export class X25519EcdheRsaSha256 {
    private readonly privateAgreementKey: Buffer;

    constructor() {
        this.privateAgreementKey = Buffer.alloc(x25519KeySize);
        crypto.randomFillSync(this.privateAgreementKey);

    }

    calculateServerMessageSize(keysize: number) {
        const signatureSize = keysize / 8;

        return 0
            + 1 // ECCurveType ServerKeyExchange.params.curve_params.curve_type
            + 2 // NamedCurve ServerKeyExchange.params.curve_params.namedcurve
            + 1 + x25519KeySize // ECPolet ServerKeyExchange.params.public
            + 1 // HashAlgorithm ServerKeyExchange.algorithm.hash
            + 1 // SignatureAlgorithm ServerKeyExchange.signed_params.algorithm.signature
            + 2 // ServerKeyExchange.signed_params.size
            + signatureSize; // ServerKeyExchange.signed_params.opaque
    }

    encodeServerKeyExchangeMessage(privateKey: Buffer) {
        const writer = HazelWriter.alloc(0);
        writer.uint8(ECCurveType.NamedCurve);
        writer.uint16(NamedCurve.x25519, true);
        writer.uint8(x25519KeySize);
        const x25519out = Buffer.alloc(x25519KeySize);
        x25519Func(x25519out, this.privateAgreementKey, basePoint);
        writer.bytes(x25519out);

        const sha256 = crypto.createHash("sha256");
        const parameterDigest = sha256.update(x25519out).digest();

        const signer = crypto.createSign("id-rsassa-pkcs1-v1_5-with-sha3-256");
        signer.update(parameterDigest);
        const signature = signer.sign({ key: privateKey });

        writer.uint8(HashAlgorithm.Sha256);
        writer.uint8(SignatureAlgorithm.RSA);
        writer.uint16(signature.length, true);
        writer.bytes(signature);
    }

    verifyServerMessageAndGenerateSharedKey(serverKeyExchangeMessage: Buffer, publicKey: Buffer) {
        const keyParameters = serverKeyExchangeMessage.slice(0, 4 + x25519KeySize);
        const othersPublicKey = keyParameters.slice(4);
        const signatureSize = serverKeyExchangeMessage.readUInt16BE(6 + x25519KeySize);
        const signature = serverKeyExchangeMessage.slice(4 + keyParameters.length);

        if (signatureSize !== signature.byteLength) {
            return false;
        }

        const sha256 = crypto.createHash("sha256");
        const parameterDigest = sha256.update(keyParameters).digest();

        const verifier = crypto.createVerify("RSA-SHA1");
        verifier.update(parameterDigest);

        const key =
              "-----BEGIN RSA PUBLIC KEY-----\n"
            + publicKey.toString("base64")
            + "\n-----END RSA PUBLIC KEY-----";


        if (!verifier.verify(key, signature)) {
            // return false;
        }

        const output = Buffer.alloc(x25519KeySize);
        x25519Func(output, this.privateAgreementKey, othersPublicKey);
        return output;
    }

    encodeClientKeyExchangeMessage(output: Buffer) {
        output[0] = x25519KeySize;
        x25519Func(output.slice(1, 1 + x25519KeySize), this.privateAgreementKey, basePoint);
    }
}
