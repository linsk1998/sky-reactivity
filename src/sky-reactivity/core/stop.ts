import type { Signal } from "./signal";

export var relation = new WeakMap<any, Map<Signal<any>, any>>;

export function stop(key: any) {
	var rel = relation.get(key);
	if(rel) {
		rel.forEach(forEachObs);
		rel.clear();
		relation.delete(key);
	}
}

function forEachObs(key: any, ob: Signal<any>) {
	ob.unobserve(key);
}