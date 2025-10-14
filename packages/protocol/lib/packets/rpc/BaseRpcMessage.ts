import { TaggedCloneable } from "../TaggedCloneable";

export abstract class BaseRpcMessage extends TaggedCloneable {
    abstract clone(): BaseRpcMessage;
}
