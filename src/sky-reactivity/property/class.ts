import { signal } from "../core/signal";
import { computed } from "../core/computed";
import { batchStart, batchEnd } from "../core/batch";

export var TARGET = "@@TARGET";

export function createClass(options): any {
	var Super = options.super;
	var reactive = options.reactive;
	var members = options.members;
	var observables = options.observables;
	var accessors = options.accessors;
	var com = options.computed;
	var methods = options.methods;
	var batches = options.batches;
	var Class = function() {
		var o = this;
		if(Super && Super !== Object) {
			Super.apply(o, arguments);
		}
		var target = o[TARGET] = {};
		var key: string;
		if(members) {
			for(key in members) {
				this[key] = members[key];
			}
		}
		if(observables) {
			for(key in observables) {
				let value = this[key];
				target[key] = signal(reactive ? reactive(value, key) : value);
				defineProperty(this, key, reactive);
			}
		}
		if(com) {
			for(key in com) {
				var desc = com[key];
				var getter = desc.get;
				var setter = desc.set;
				target[key] = computed(getter.bind(o), setter && setter.bind(o));
				defineProperty(this, key, reactive);
			}
		}
		if(methods) {
			for(key in methods) {
				o[key] = methods[key].bind(o);
			}
		}
		if(batches) {
			var keys = Object.keys(batches);
			keys.forEach(function(key) {
				var fn = batches[key];
				this[key] = function() {
					try {
						batchStart();
						fn.apply(o, arguments);
					} catch(e) {
						console.error(e);
					} finally {
						batchEnd();
					}
				};
			}, o);
		}
		Object.preventExtensions(o);
	};
	if(Super && Super !== Object) {
		Class.prototype = Object.create(Super.prototype);
		Object.setPrototypeOf(Class, Super);
	}
	Class.prototype.constructor = Class;
	var key: string;
	if(accessors) {
		for(key in accessors) {
			var accessor = accessors[key];
			Object.defineProperty(Class.prototype, key, {
				set: accessor.set,
				get: accessor.get,
				enumerable: true,
				configurable: false
			});
		}
	}
	return Class;
}
function defineProperty(r: any, key: string, reactive: Function) {
	Object.defineProperty(r, key, {
		set: reactive ? function(v) {
			this[TARGET][key].set(reactive(v, key));
		} : function(v) {
			this[TARGET][key].set(v);
		},
		get: function() {
			return this[TARGET][key].get();
		},
		enumerable: true,
		configurable: false
	});
}
