import { effect, createClass } from "../../dist/sky-reactivity.vbscript.esnext.mjs";

QUnit.test('class#key', function(assert) {
	var Class = createClass({
		a: 1,
		b: undefined
	});
	var object = new Class();
	var i = 0;
	effect({}, () => object.a, () => {
		i++;
	});
	assert.equal(i, 0);
	object.a = 2;
	assert.equal(i, 1);

	var j = 0;
	effect({}, () => object.b, () => {
		j++;
	});
	assert.equal(j, 0);
	object.b = 2;
	assert.equal(j, 1);
});