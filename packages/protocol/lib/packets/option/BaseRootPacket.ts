import { TaggedCloneable } from "../TaggedCloneable";

export abstract class BaseRootPacket extends TaggedCloneable {
    abstract clone(): BaseRootPacket;
}