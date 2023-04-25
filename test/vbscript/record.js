import { effect, reactive } from "../../dist/sky-reactivity.vbscript.esnext.mjs";

QUnit.test('record#key', function(assert) {
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