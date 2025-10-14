import { TaggedCloneable } from "../TaggedCloneable";

export abstract class BaseRootMessage extends TaggedCloneable {
    abstract clone(): BaseRootMessage;
}
