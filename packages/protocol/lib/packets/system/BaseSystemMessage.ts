import { TaggedCloneable } from "../TaggedCloneable";

export abstract class BaseSystemMessage extends TaggedCloneable {
    abstract clone(): BaseSystemMessage;
}
