import { describe, it } from "mocha";
import { assert } from "chai";
import { effect, stop, Signal, Computed, batch } from "../dist/sky-reactivity.proxy.esnext.mjs";

describe("box", function() {
	it("signal", function() {
		var box = new Signal(1);
		assert.equal(box.get(), 1);
		var key = {};
		var i = 0;
		box.observe(key, () => {
			i++;
		});
		assert.equal(box.get(), 1);
		box.set(2);
		assert.equal(box.get(), 2);
		assert.equal(i, 1);
		box.set(1);
		assert.equal(box.get(), 1);
		assert.equal(i, 2);
		box.unobserve(key);
		box.set(3);
		assert.equal(i, 2);
	});
	it("effect", function() {
		var key = {};
		var box = new Signal(1);
		var i = 0;
		var v = effect(key, () => box.get(), () => {
			i++;
		});
		assert.equal(i, 0);
		assert.equal(v, 1);
		box.set(100);
		assert.equal(i, 1);
		assert.equal(box.get(), 100);
		box.set(200);
		assert.equal(i, 2);
		assert.equal(box.get(), 200);
		stop(key);
		box.set(300);
		assert.equal(i, 2);
		assert.equal(box.get(), 300);
	});
	it("computed", function() {
		var key = {};
		var box = new Signal(1);
		var computed = new Computed(() => box.get() * 2);
		assert.equal(computed.get(), 2);
		var i = 0;
		computed.observe(key, () => {
			i++;
		});
		assert.equal(i, 0);
		box.set(2);
		assert.equal(i, 1);
		assert.equal(computed.get(), 4);
		box.set(3);
		assert.equal(i, 2);
		assert.equal(computed.get(), 6);
		computed.unobserve(key);
		box.set(4);
		assert.equal(i, 2);
		assert.equal(computed.get(), 8);
		i = 0;
		var v = effect(key, () => computed.get(), () => {
			i++;
		});
		assert.equal(i, 0);
		assert.equal(v, 8);
		box.set(5);
		assert.equal(i, 1);
		assert.equal(computed.get(), 10);
		box.set(6);
		assert.equal(i, 2);
		assert.equal(computed.get(), 12);
		stop(key);
		box.set(7);
		assert.equal(i, 2);
		assert.equal(computed.get(), 14);

		var i2 = 0;
		var box2 = new Signal(1);
		var computed2 = new Computed(() => {
			i2++;
			return box2.get() * 2;
		});
		assert.equal(i2, 0);
		computed2.get();
		assert.equal(i2, 1);
		box2.set(2);
		assert.equal(i2, 1);
	});
	it("action", function() {
		var key1 = {};
		var key2 = {};
		var box = new Signal(1);
		var computed = new Computed(() => box.get() * 2);
		var i = 0, j = 0;
		box.observe(key1, () => {
			i++;
		});
		computed.observe(key2, () => {
			j++;
		});
		assert.equal(i, 0);
		assert.equal(j, 0);
		assert.equal(box.get(), 1);
		assert.equal(computed.get(), 2);
		batch(() => {
			assert.equal(i, 0);
			assert.equal(j, 0);
			box.set(1);
			assert.equal(i, 0);
			assert.equal(j, 0);
			box.set(3);
			assert.equal(i, 0);
			assert.equal(j, 0);
		});
		assert.equal(i, 1);
		assert.equal(j, 1);
	});
	it("computed-action", function() {
		var i = 0;
		var j = 0;
		var a = new Signal(1);
		var b = new Signal(1);
		var c = new Computed(() => {
			i++;
			return a.get() * b.get();
		});
		effect({}, () => {
			c.get();
		}, () => {
			j++;
		});
		assert.equal(j, 0);
		batch(() => {
			assert.equal(i, 1);
			a.set(2);
			assert.equal(i, 1);
			b.set(2);
			assert.equal(i, 1);
			assert.equal(a.get(), 2);
			assert.equal(c.get(), 4);
			assert.equal(i, 2);
			assert.equal(j, 1);
		});
		assert.equal(j, 1);
	});
});