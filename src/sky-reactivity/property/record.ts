import { Signal } from "../core/signal";

export var TARGET = "@@TARGET";

export function record(o: any, reactive: Function) {
	var m = {};
	var r = {};
	r[TARGET] = m;
	for(var key in o) {
		var prefix = key.substring(0, 2);
		switch(prefix) {
			case "__":
			case "@@":
				break;
			default:
				m[key] = new Signal(reactive(o[key], key));
				defineProperty(r, key, reactive);
		}
	}
	return r;
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
