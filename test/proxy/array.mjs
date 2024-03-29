import { describe, it } from "mocha";
import { assert } from "chai";
import { effect, reactive } from "../../dist/sky-reactivity.proxy.esnext.mjs";

describe("proxy", function() {
	describe("array", function() {
		const LENGTH = 'length';
		it("length", function() {
			var array = reactive([]);
			assert.equal(array.length, 0);
			assert.ok(array instanceof Array);
			assert.ok(Array.isArray(array));
		});
		it("at", function() {
			var array = reactive([]);
			var key = {};
			var i = 0;
			effect(key, () => array.at(0), () => {
				i++;
			});
			assert.equal(i, 0);
			array.push(0);
			assert.equal(i, 1);
			assert.equal(array.at(0), 0);
		});
		it("push", function() {
			var array = reactive([]);
			var counts = new Map();
			new Array(8).fill(1).forEach((_, i) => {
				var key = i - 2;
				counts.set(key, 0);
				effect({}, () => array.at(key), () => {
					var count = counts.get(key);
					count++;
					counts.set(key, count);
				});
			});
			counts.set(LENGTH, 0);
			effect({}, () => array.length, () => {
				var count = counts.get(LENGTH);
				count++;
				counts.set(LENGTH, count);
			});
			assert.equal(array.length, 0);
			// []
			// -2 -1  0  1  2  3  4  5
			//  x  x  x  x  x  x  x  x
			array.push(0);
			assert.equal(array.length, 1);
			assert.equal(counts.get(LENGTH), 1);
			assert.equal(counts.get(-2), 1);
			assert.equal(counts.get(-1), 1);
			assert.equal(counts.get(0), 1);
			assert.equal(counts.get(1), 1);
			assert.equal(counts.get(2), 1);
			assert.equal(counts.get(3), 1);
			assert.equal(counts.get(4), 1);
			assert.equal(counts.get(5), 1);
		});
		it("pop", function() {
			var array = reactive([1, 2, 3, 4, 5]);
			assert.equal(array.length, 5);
			var counts = new Map();
			new Array(5).fill(1).forEach((_, i) => {
				var key = i - 2;
				counts.set(key, 0);
				effect({}, () => array.at(key), () => {
					var count = counts.get(key);
					count++;
					counts.set(key, count);
				});
			});
			counts.set(LENGTH, 0);
			effect({}, () => array.length, () => {
				var count = counts.get(LENGTH);
				count++;
				counts.set(LENGTH, count);
			});
			// [1, 2, 3, 4, 5]
			// -2 -1  0  1  2  3  4  5
			//  4  5  1  2  3  4  5  x
			array.pop();
			assert.equal(array.length, 4);
			assert.equal(counts.get(-2), 1);
			assert.equal(counts.get(LENGTH), 1);
			assert.equal(counts.get(-2), 1);
			assert.equal(counts.get(-1), 1);
			assert.equal(counts.get(0), 1);
			assert.equal(counts.get(1), 1);
			assert.equal(counts.get(2), 1);
		});
		it("unshift", function() {
			var array = reactive([]);
			assert.equal(array.length, 0);
			var counts = new Map();
			new Array(5).fill(1).forEach((_, i) => {
				var key = i - 2;
				counts.set(key, 0);
				effect({}, () => array.at(key), () => {
					var count = counts.get(key);
					count++;
					counts.set(key, count);
				});
			});
			counts.set(LENGTH, 0);
			effect({}, () => array.length, () => {
				var count = counts.get(LENGTH);
				count++;
				counts.set(LENGTH, count);
			});
			[];
			// -2 -1  0  1  2
			//  x  x  x  x  x
			array.unshift(1);
			assert.equal(array.length, 1);
			assert.equal(counts.get(LENGTH), 1);
			assert.equal(counts.get(-2), 1);
			assert.equal(counts.get(-1), 1);
			assert.equal(counts.get(0), 1);
			assert.equal(counts.get(1), 1);
			assert.equal(counts.get(2), 1);
		});
		it("shift", function() {
			var array = reactive([1, 2, 3, 4, 5]);
			assert.equal(array.length, 5);
			var counts = new Map();
			new Array(5).fill(1).forEach((_, i) => {
				var key = i - 2;
				counts.set(key, 0);
				effect({}, () => array.at(key), () => {
					var count = counts.get(key);
					count++;
					counts.set(key, count);
				});
			});
			counts.set(LENGTH, 0);
			effect({}, () => array.length, () => {
				var count = counts.get(LENGTH);
				count++;
				counts.set(LENGTH, count);
			});
			// [1, 2, 3, 4, 5]
			// -2 -1  0  1  2  3
			//  4  5  1  2  3  4
			array.shift();
			assert.equal(array.length, 4);
			assert.equal(counts.get(LENGTH), 1);
			assert.equal(counts.get(-2), 1);
			assert.equal(counts.get(-1), 1);
			assert.equal(counts.get(0), 1);
			assert.equal(counts.get(1), 1);
			assert.equal(counts.get(2), 1);
		});
		it("splice", function() {
			var array = reactive([1, 2, 3, 4, 5]);
			assert.equal(array.length, 5);
			var counts = new Map();
			new Array(5).fill(1).forEach((_, i) => {
				var key = i - 2;
				counts.set(key, 0);
				effect({}, () => array.at(key), () => {
					var count = counts.get(key);
					count++;
					counts.set(key, count);
				});
			});
			counts.set(LENGTH, 0);
			effect({}, () => array.length, () => {
				var count = counts.get(LENGTH);
				count++;
				counts.set(LENGTH, count);
			});
			// [1, 2, 3, 4, 5]
			// -2 -1  0  1  2  3  4  5
			//  4  5  1  2  3  4  5  x
			array.splice(1, 1);
			assert.equal(array.length, 4);
			assert.equal(counts.get(LENGTH), 1);
			assert.equal(counts.get(-2), 1);
			assert.equal(counts.get(-1), 1);
			assert.equal(counts.get(0), 1);
			assert.equal(counts.get(1), 1);
			assert.equal(counts.get(2), 1);
		});
	});
});
