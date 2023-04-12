import { describe, it } from "mocha";
import { assert } from "chai";
import { effect, reactive } from "../../dist/sky-reactivity.property.esnext.mjs";

describe("property", function() {
	describe("record", function() {
		it("key", function() {
			var object = reactive({
				name: "Tom"
			});
			var key = {};
			var i = 0;
			effect(key, () => object.name, () => {
				i++;
			});
			assert.equal(i, 0);
			object.name = "Jerry";
			assert.equal(i, 1);
		});
	});
});