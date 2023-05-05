import { batchEnd, batchStart } from "../core/batch";
import { signal } from "../core/signal";

const TARGET = '@@TARGET';
const SIGNALS = '@@SIGNALS';
const SIGNAL = '@@SIGNAL';
const LENGTH = '@@LENGTH';
const REACTIVE = '@@REACTIVE';


window.execScript([
	'Class VBReactiveArray',
	'	Public [@@TARGET]',
	'	Public [@@LENGTH]',
	'	Public [@@SIGNALS]',
	'	Public [@@SIGNAL]',
	'	Public [@@REACTIVE]',
	'	Public [@@WeakMap]',
	'	Public [__proto__]',
	'	Public [constructor]',
	'	Public Property Let [length](var)',
	'		Call Me.[@@LENGTH].set(var)',
	'		Me.[@@TARGET].length = var',
	'	End Property',
	'	Public Property Get [length]',
	'		[length] = Me.[@@LENGTH].get()',
	'	End Property',
	'	Public [at]',
	'	Public [push]',
	'	Public [pop]',
	'	Public [unshift]',
	'	Public [shift]',
	'	Public [splice]',
	'	Public [map]',
	'	Public [filter]',
	'	Public [concat]',
	'End Class',
	'Function VBReactiveArrayFactory()',
	'	Set VBReactiveArrayFactory = New VBReactiveArray',
	'End Function'
].join('\n'), 'VBScript');

export function array(arr, reactive) {
	var i = arr.length;
	var r = ReactiveArray(i);
	var target = r[TARGET];
	r[SIGNALS] = new Map();
	r[REACTIVE] = reactive;
	while(i-- > 0) {
		target[i] = reactive(arr[i], i);
	}
	return r;
}


function ReactiveArray(length) {
	var r = VBReactiveArrayFactory();
	var target = r[TARGET] = new Array(length);
	r[SIGNALS] = new Map();
	r[LENGTH] = signal(length);
	r[SIGNAL] = signal(false);
	r.__proto__ = ReactiveArray.prototype;
	r.constructor = ReactiveArray;
	r.at = at.bind(r);
	r.push = push.bind(r);
	r.pop = pop.bind(r);
	r.unshift = unshift.bind(r);
	r.shift = shift.bind(r);
	r.splice = splice.bind(r);
	r.map = map.bind(r);
	r.filter = filter.bind(r);
	r.concat = concat.bind(r);
	return r;
}
ReactiveArray.prototype = Object.create(Array.prototype);
ReactiveArray.prototype.at = at;
ReactiveArray.prototype.push = push;
ReactiveArray.prototype.pop = pop;
ReactiveArray.prototype.unshift = unshift;
ReactiveArray.prototype.shift = shift;
ReactiveArray.prototype.splice = splice;

function at(n) {
	var target = this[TARGET];
	var r = n < 0 ? target[n + this[LENGTH].value] : target[n];
	var map = this[SIGNALS];
	var box = map.get(n);
	if(!box) {
		box = signal(r);
		map.set(n, box);
	}
	box.get();
	return r;
}
function push() {
	var reactive = this[REACTIVE];
	try {
		batchStart();
		var oldLength = this.length;
		var items = Array.prototype.slice.call(arguments);
		items = items.map(reactive);
		var target = this[TARGET];
		var newLength = Array.prototype.push.apply(target, items);
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				key = key + newLength;
				if(key >= 0) {
					signal.set(target[key]);
				}
			} else if(oldLength <= key && key < newLength) {
				signal.set(target[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return newLength;
	} finally {
		batchEnd();
	}
}
function pop() {
	try {
		batchStart();
		var oldLength = this.length;
		var target = this[TARGET];
		Array.prototype.pop.call(target);
		var newLength = target.length;
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				if(key + oldLength >= 0) {
					signal.set(target[key + newLength]);
				}
			} else if(newLength === key) {
				signal.set(target[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return newLength;
	} finally {
		batchEnd();
	}
}
function unshift() {
	var reactive = this[REACTIVE];
	try {
		batchStart();
		var oldLength = this.length;
		var args = [], len = arguments.length;
		for(var i = 0; i < len; i++) {
			args[i] = reactive(arguments[i]);
		}
		var target = this[TARGET];
		var r = Array.prototype.unshift.apply(target, args);
		var newLength = target.length;
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				if(key + oldLength < 0) {
					key = key + newLength;
					if(0 <= key) {
						signal.set(target[key]);
					}
				}
			} else if(key < newLength) {
				signal.set(target[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return r;
	} finally {
		batchEnd();
	}
}
function shift() {
	try {
		batchStart();
		var oldLength = this.length;
		var target = this[TARGET];
		var r = Array.prototype.shift.call(target);
		var newLength = target.length;
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				if(0 <= key + oldLength) {
					key = key + newLength;
					if(key < 0) {
						signal.set(target[key]);
					}
				}
			} else if(oldLength > key) {
				signal.set(target[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return r;
	} finally {
		batchEnd();
	}
}
function splice() {
	var reactive = this[REACTIVE];
	try {
		batchStart();
		var args = [], len = arguments.length;
		for(var i = 0; i < len; i++) {
			args[i] = i > 1 ? reactive(arguments[i]) : arguments[i];
		}
		var target = this[TARGET];
		var r = Array.prototype.splice.apply(target, args);
		var newLength = target.length;
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				signal.set(target[key + newLength]);
			} else {
				signal.set(target[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return array(r, reactive);
	} finally {
		batchEnd();
	}
}
function map() {
	this[SIGNAL].get();
	return Array.prototype.map.apply(this[TARGET], arguments);
}

function filter() {
	this[SIGNAL].get();
	return Array.prototype.filter.apply(this[TARGET], arguments);
}

function concat() {
	this[SIGNAL].get();
	return Array.prototype.concat.apply(this[TARGET], arguments);
}
