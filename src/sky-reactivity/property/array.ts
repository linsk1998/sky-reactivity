import { Signal } from "../core/signal";

const SIGNAL = '@@SIGNAL';
const REACTIVE = '@@REACTIVE';

var slice = Array.prototype.slice;

var prototype = Object.create(Array.prototype);

var at = Array.prototype.at;
prototype.at = function() {
	this[SIGNAL].get();
	return at.apply(this, arguments);
};

['map', 'filter', 'concat'].forEach(function(key) {
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
export function array(arr: any[], reactive: Function) {
	var i = arr.length;
	var r = new Array(i);
	r[SIGNAL] = new Signal(false);
	r[REACTIVE] = reactive;
	while(i-- > 0) {
		r[i] = reactive(arr[i], i) as any;
	}
	allprops.forEach(setMethod, r);
	return r;
}

function setMethod(key: string) {
	this[key] = prototype[key];
}