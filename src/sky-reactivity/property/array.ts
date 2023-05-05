import { batchEnd, batchStart } from "../core/batch";
import { Signal } from "../core/signal";

const SIGNALS = '@@SIGNALS';
const SIGNAL = '@@SIGNAL';
const LENGTH = '@@LENGTH';
const REACTIVE = '@@REACTIVE';


export function array(arr: any[], reactive: Function) {
	var i = arr.length;
	var r = Object.create(ReactiveArray.prototype);
	r[SIGNALS] = new Map();
	r[LENGTH] = new Signal(i);
	r[REACTIVE] = reactive;
	while(i-- > 0) {
		r[i] = reactive(arr[i], i) as any;
	}
	return r;
}


function ReactiveArray() {
}
ReactiveArray.prototype = Object.create(Array.prototype);
ReactiveArray.constructor = ReactiveArray;
Object.setPrototypeOf(ReactiveArray, Array);

Object.defineProperty(ReactiveArray.prototype, 'length', {
	get: function() {
		return this[LENGTH].get();
	},
	set: function(value) {
		this[LENGTH].set(value);
	},
	enumerable: false,
	configurable: false
});

ReactiveArray.prototype.at = function(n) {
	var r = n < 0 ? this[n + this[LENGTH].value] : this[n];
	var map = this[SIGNALS];
	var box = map.get(n);
	if(!box) {
		box = new Signal(r);
		map.set(n, box);
	}
	box.get();
	return r;
};
ReactiveArray.prototype.push = function() {
	var reactive = this[REACTIVE];
	try {
		batchStart();
		var oldLength = this.length;
		var items = Array.prototype.slice.call(arguments);
		items = items.map(reactive);
		var newLength = Array.prototype.push.apply(this, items);
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				key = key + newLength;
				if(key >= 0) {
					signal.set(this[key]);
				}
			} else if(oldLength <= key && key < newLength) {
				signal.set(this[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return newLength;
	} finally {
		batchEnd();
	}
};
ReactiveArray.prototype.pop = function() {
	try {
		batchStart();
		var oldLength = this.length;
		var r = Array.prototype.pop.call(this);
		var newLength = this.length;
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				if(key + oldLength >= 0) {
					signal.set(this[key + newLength]);
				}
			} else if(newLength === key) {
				signal.set(this[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return r;
	} finally {
		batchEnd();
	}
};
ReactiveArray.prototype.unshift = function() {
	var reactive = this[REACTIVE];
	try {
		batchStart();
		var oldLength = this.length;
		var args = [], len = arguments.length;
		for(var i = 0; i < len; i++) {
			args[i] = reactive(arguments[i]);
		}
		var newLength = Array.prototype.unshift.apply(this, args);
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				if(key + oldLength < 0) {
					key = key + newLength;
					if(0 <= key) {
						signal.set(this[key]);
					}
				}
			} else if(key < newLength) {
				signal.set(this[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return newLength;
	} finally {
		batchEnd();
	}
};
ReactiveArray.prototype.shift = function() {
	try {
		batchStart();
		var oldLength = this.length;
		var r = Array.prototype.shift.call(this);
		var newLength = this.length;
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				if(0 <= key + oldLength) {
					key = key + newLength;
					if(key < 0) {
						signal.set(this[key]);
					}
				}
			} else if(oldLength > key) {
				signal.set(this[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return r;
	} finally {
		batchEnd();
	}
};
ReactiveArray.prototype.splice = function() {
	var reactive = this[REACTIVE];
	try {
		batchStart();
		var args = [], len = arguments.length;
		for(var i = 0; i < len; i++) {
			args[i] = i > 1 ? reactive(arguments[i]) : arguments[i];
		}
		var r = Array.prototype.splice.apply(this, args);
		var newLength = this.length;
		var map = this[SIGNALS];
		map.forEach((signal, key) => {
			if(key < 0) {
				signal.set(this[key + newLength]);
			} else {
				signal.set(this[key]);
			}
		});
		this[LENGTH].set(newLength);
		var s = this[SIGNAL];
		s.set(!s.get());
		return array(r, reactive);
	} finally {
		batchEnd();
	}
};

ReactiveArray.prototype.map = function() {
	this[SIGNAL].get();
	return Array.prototype.map.apply(this, arguments);
};

ReactiveArray.prototype.filter = function() {
	this[SIGNAL].get();
	return Array.prototype.filter.apply(this, arguments);
};

ReactiveArray.prototype.concat = function() {
	this[SIGNAL].get();
	return Array.prototype.concat.apply(this, arguments);
};
