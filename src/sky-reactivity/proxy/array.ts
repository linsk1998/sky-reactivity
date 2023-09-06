import { batchEnd, batchStart } from "../core/batch";
import { Signal } from "../core/signal";


const SIGNAL = Symbol();
const REACTIVE = Symbol();

export function array<T>(arr: T[], reactive: Function): Array<T> {
	var i = arr.length;
	var r = new ReactiveArray();
	r.length = i;
	r[SIGNAL] = new Signal(false);
	r[REACTIVE] = reactive;
	while(i-- > 0) {
		r[i] = reactive(arr[i], i) as any;
	}
	return new Proxy(r, {
		get: function(target, key) {
			if(key === 'length') {
				target[SIGNAL].get();
			}
			return Reflect.get(target, key);
		},
		set: function(target, key, value) {
			return Reflect.set(target, key, value);
		}
	});
}

function ReactiveArray() {
}
ReactiveArray.prototype = Object.create(Array.prototype);
ReactiveArray.constructor = ReactiveArray;
Object.setPrototypeOf(ReactiveArray, Array);

['at', 'map', 'filter', 'concat'].forEach(function(key) {
	var fn = Array.prototype[key];
	ReactiveArray.prototype[key] = function() {
		this[SIGNAL].get();
		return fn.apply(this, arguments);
	};
});
['push', 'pop', 'unshift', 'shift', 'splice'].forEach(function(key) {
	var fn = Array.prototype[key];
	ReactiveArray.prototype[key] = function() {
		var s = this[SIGNAL];
		s.set(!s.get());
		return fn.apply(this, arguments);
	};
});