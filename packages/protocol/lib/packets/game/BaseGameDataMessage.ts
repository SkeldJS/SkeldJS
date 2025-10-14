import { TaggedCloneable } from "../TaggedCloneable";

export abstract class BaseGameDataMessage extends TaggedCloneable {
    abstract clone(): BaseGameDataMessage;
}
