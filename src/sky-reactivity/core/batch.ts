import { notify } from "./notify";

export var deep = 0;
export var actionsToDo = new Map<any, Function>();

export function batch(fn: Function) {
	try {
		batchStart();
		fn.call(this);
	} catch(e) {
		console.error(e);
	} finally {
		batchEnd();
	}
}

export function batchStart() {
	deep++;
}
export function batchEnd() {
	deep--;
	if(deep === 0) {
		try {
			actionsToDo.forEach(notify);
		} catch(e) {
			console.error(e);
		} finally {
			actionsToDo.clear();
		}
	}
}

export function collectCallback(callback: Function, key: any) {
	actionsToDo.set(key, callback);
}