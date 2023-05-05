import { createClass } from "./class";

var cache = {};

export function record(o, reactive) {
	var keys = Object.keys(o).sort();
	var key = keys.join("\n");
	var Class = cache[key];
	if(!Class) {
		Class = createClass({
			observables: o
		}, reactive);
		cache[key] = Class;
	}
	var r = new Class();
	var i = keys.length;
	while(i--) {
		key = keys[i];
		r[key] = o[key];
	}
	return r;
}
