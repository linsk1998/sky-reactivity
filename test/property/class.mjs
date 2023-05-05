import { describe, it } from "mocha";
import { assert } from "chai";
import { effect, createClass } from "../../dist/sky-reactivity.property.esnext.mjs";

var Class = createClass({
	members: {
		a: undefined
	},
	observables: {
		b: undefined
	},
	accessors: {
		c: {
			get: function() {
				return this.a * 2;
			}
		},
		d: {
			get: function() {
				return this.a * 2;
			},
			set: function(v) {
				this.a = v / 2;
			}
		}
	},
	computed: {
		e: {
			get: function() {
				return this.b * 2;
			}
		},
		f: {
			get: function() {
				return this.b * 2;
			},
			set: function(v) {
				this.b = v / 2;
			}
		}
	},
	methods: {
		g: function() {
			this.a++;
		}
	},
	batches: {
		h: function() {
			this.b++;
			this.b++;
		}
	}
});

describe("property", function() {
	describe("class", function() {
		it("dirct-member", function() {
			var object = new Class();
			object.a = 1;
			object.b = 1;
			var i = 0;
			var a = effect({}, () => object.a, () => {
				i++;
			});
			assert.equal(a, 1);
			assert.equal(i, 0);
			object.a = 2;
			assert.equal(i, 0);
		});
		it("observable-key", function() {
			var object = new Class();
			object.a = 1;
			object.b = 1;
			var i = 0;
			var b = effect({}, () => object.b, () => {
				i++;
			});
			assert.equal(b, 1);
			assert.equal(i, 0);
			object.b = 2;
			assert.equal(i, 1);
		});
		it("dirct-accessor", function() {
			var object = new Class();
			object.a = 1;
			object.b = 1;
			var i = 0;
			var c = effect({}, () => object.c, () => {
				i++;
			});
			assert.equal(object.a, 1);
			assert.equal(c, 2);
			assert.equal(i, 0);
			assert.throws(function() {
				object.c = 4;
			});
			assert.equal(i, 0);

			var j = 0;
			var d = effect({}, () => object.d, () => {
				j++;
			});
			assert.equal(d, 2);
			assert.equal(j, 0);
			object.d = 4;
			assert.equal(j, 0);
			assert.equal(object.d, 4);
			assert.equal(object.a, 2);
		});
		it("computed-key", function() {
			var object = new Class();
			object.a = 1;
			object.b = 1;
			var i = 0;
			var e = effect({}, () => object.e, () => {
				i++;
			});
			assert.equal(object.b, 1);
			assert.equal(e, 2);
			assert.equal(i, 0);
			assert.throws(function() {
				object.e = 4;
			});
			assert.equal(i, 0);

			var j = 0;
			var f = effect({}, () => object.f, () => {
				j++;
			});
			assert.equal(f, 2);
			assert.equal(j, 0);
			object.f = 4;
			assert.equal(j, 1);
			assert.equal(object.f, 4);
			assert.equal(object.b, 2);
		});
		it("method-bind", function() {
			var object = new Class();
			object.a = 1;
			object.b = 1;
			var i = 0;
			var a = effect({}, () => object.a, () => {
				i++;
			});
			assert.equal(a, 1);
			assert.equal(i, 0);
			var g = object.g;
			g();
			assert.equal(object.a, 2);
			assert.equal(i, 0);
		});
		it("batches-key", function() {
			var object = new Class();
			object.a = 1;
			object.b = 1;
			var i = 0;
			var b = effect({}, () => object.b, () => {
				i++;
			});
			assert.equal(b, 1);
			assert.equal(i, 0);
			var h = object.h;
			h();
			assert.equal(object.b, 3);
			assert.equal(i, 1);
		});
	});
});
