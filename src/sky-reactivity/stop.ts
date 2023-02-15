import type { Observable } from "./observable";

export var relation = new WeakMap<any, Map<Observable<any>, any>>;

export function stop(key: any) {
	var rel = relation.get(key);
	if(rel) {
		rel.forEach(forEachObs);
		rel.clear();
		relation.delete(key);
	}
}

function forEachObs(key: any, ob: Observable<any>) {
	ob.unobserve(key);
}