import { Signal, signal } from "../core/signal";

export var TARGET = Symbol();

export function createClass<T>(o: T, Super?: Function, getSignals?: (keys: string[]) => Record<string, Signal<any>>): { new(): T; } {
	var keys = Object.keys(o);
	var Class = function() {
		var target: Record<string, Signal<any>>;
		if(getSignals) {
			target = getSignals.call(this, keys);
		} else {
			target = {};
			var i = keys.length;
			while(i--) {
				target[keys[i]] = signal(undefined);
			}
		}
		this[TARGET] = target;
		Object.preventExtensions(this);
	};
	if(Super) {
		Object.setPrototypeOf(Class, Super);
		Class.prototype = Object.create(Super.prototype);
	}
	Class.prototype.constructor = Class;
	var i = keys.length;
	while(i--) {
		defineProperty(Class.prototype, keys[i]);
	}
	return Class as any;
}
function defineProperty(r: any, key: string) {
	Object.defineProperty(r, key, {
		set: function(v) {
			this[TARGET][key].set(v);
		},
		get: function() {
			return this[TARGET][key].get();
		},
		enumerable: true,
		configurable: false
	});
}