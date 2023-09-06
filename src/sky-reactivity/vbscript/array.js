const SIGNAL = '@@SIGNAL';
const REACTIVE = '@@REACTIVE';

export function array(arr, reactive) {
	var i = arr.length;
	var r = new ReactiveArray();
	r.length = i;
	r[SIGNAL] = new Signal(false);
	r[REACTIVE] = reactive;
	while(i-- > 0) {
		r[i] = reactive(arr[i], i);
	}
	return r;
}


function ReactiveArray() {
}
for(var key in Array) {
	var prefix = key.substring(0, 2);
	switch(prefix) {
		case "__":
		case "@@":
			break;
		default:
			ReactiveArray[key] = Array;
	}
}
ReactiveArray.prototype = [];
ReactiveArray.constructor = ReactiveArray;
ReactiveArray.__proto__ = Array;

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