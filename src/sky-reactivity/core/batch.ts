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
	if(deep === 1) {
		actionsToDo.forEach(notifyAndRemove);
	}
	deep--;
	if(deep === 0) {
		actionsToDo.forEach(notifyAndRemove);
	}
}

function notifyAndRemove(callback: Function, key: any, map: Map<any, Function>) {
	try {
		callback.call(key);
	}
	catch(e) {
		console.error(e);
	}
	finally {
		map.delete(key);
	}
}

export function collectCallback(callback: Function, key: any) {
	actionsToDo.set(key, callback);
}