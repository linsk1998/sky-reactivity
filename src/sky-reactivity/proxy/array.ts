import { Signal } from "../core/signal";


const SIGNAL = Symbol();
const REACTIVE = Symbol();

var slice = Array.prototype.slice;

var prototype = Object.create(Array.prototype);

['at', 'map', 'filter', 'concat'].forEach(function(key) {
	var fn = Array.prototype[key];
	prototype[key] = function() {
		this[SIGNAL].get();
		return fn.apply(this, arguments);
	};
});
['push', 'unshift'].forEach(function(key) {
	var fn = Array.prototype[key];
	prototype[key] = function() {
		var reactive = this[REACTIVE];
		var items = slice.call(arguments);
		items = items.map(reactive);
		var r = fn.apply(this, items);
		var s = this[SIGNAL];
		s.set(!s.get());
		return r;
	};
});
['pop', 'shift'].forEach(function(key) {
	var fn = Array.prototype[key];
	prototype[key] = function() {
		var r = fn.apply(this, arguments);
		var s = this[SIGNAL];
		s.set(!s.get());
		return r;
	};
});

var splice = Array.prototype.splice;
prototype.splice = function() {
	var items = slice.call(arguments);
	if(items.length > 2) {
		var reactive = this[REACTIVE];
		var index = items[0];
		var length = items[1];
		items = items.map(reactive);
		items.shift(index, length);
	}
	var r = splice.apply(this, arguments);
	var s = this[SIGNAL];
	s.set(!s.get());
	return r;
};

var allprops = ['at', 'map', 'filter', 'concat', 'push', 'unshift', 'pop', 'shift', 'splice'];
export function array<T>(arr: T[], reactive: Function): Array<T> {
	var i = arr.length;
	var r = new Array(i);
	r[SIGNAL] = new Signal(false);
	r[REACTIVE] = reactive;
	while(i-- > 0) {
		r[i] = reactive(arr[i], i) as any;
	}
	allprops.forEach(setMethod, r);
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

function setMethod(key: string) {
	this[key] = prototype[key];
}