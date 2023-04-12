import { array } from "./array";
import { record } from "./record";

var isReactive = new WeakMap();

export function reactive(o: any) {
	if(o == null) {
		return o;
	}
	if(Array.isArray(o)) {
		if(isReactive.get(o)) {
			return o;
		}
		o = array(o, reactive);
		isReactive.set(o, true);
	} else if(o.constructor === Object) {
		if(isReactive.get(o)) {
			return o;
		}
		return record(o, reactive);
	}
	return o;
}