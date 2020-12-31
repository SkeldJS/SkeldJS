import assert from "assert"

import {
    isEmpty
} from "./isEmpty"

describe("isEmpty", () => {
    it("Should determine whether a given object is empty or not.", () => {
        assert(isEmpty({}));
        assert(isEmpty([]));
        
        assert(!isEmpty({
            ok: 5,
            hello: 1
        }));
        assert(!isEmpty([5, 7, 8]));

        assert(!isEmpty("hello"));
        assert(!isEmpty(""));
        
        assert(!isEmpty(0));
        assert(!isEmpty(false));
    });
});