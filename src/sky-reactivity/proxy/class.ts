import { Signal, signal } from "../core/signal";
import { computed } from "../core/computed";
import { batchStart, batchEnd } from "../core/batch";

export const TARGET = Symbol();

interface Accessor<T> {
	get(): T;
	set(v: T): void;
}

interface ClassOptions {
	members?: Record<string, any>;
	observables?: Record<string, any>;
	accessors?: Record<string, Accessor<any>>;
	computed?: Record<string, Accessor<any>>;
	methods?: Record<string, Function>;
	batches?: Record<string, Function>;
	super?: any;
	reactive?: (o: any, key: string) => any;
}

export function createClass<T>(options: ClassOptions): { new(): any; } {
	var Super = options.super || Object;
	var reactive = options.reactive;
	var members = options.members;
	var observables = options.observables;
	var accessors = options.accessors;
	var com = options.computed;
	var methods = options.methods;
	var batches = options.batches;
	var Class = class extends Super {
		declare [TARGET]: Record<string, Signal<any>>;
		constructor() {
			super();
			var target = this[TARGET] = {};
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
					target[key] = computed(getter.bind(this), setter && setter.bind(this));
					defineProperty(this, key, reactive);
				}
			}
			if(methods) {
				for(key in methods) {
					this[key] = methods[key].bind(this);
				}
			}
			if(batches) {
				for(let key in batches) {
					let fn = batches[key];
					let me = this;
					this[key] = function() {
						try {
							batchStart();
							fn.apply(me, arguments);
						} catch(e) {
							console.error(e);
						} finally {
							batchEnd();
						}
					};
				}
			}
			Object.preventExtensions(this);
		}
	};
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
	return Class as any;
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
