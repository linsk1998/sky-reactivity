import { notify } from "./notify";

export var deep = 0;
export var actionsToDo = new Map<any, Function>();

export function action(fn: Function) {
	try {
		actionStart();
		fn.call(this);
	} finally {
		actionEnd();
	}
}

export function actionStart() {
	deep++;
}
export function actionEnd() {
	if(deep === 1) {
		actionsToDo.forEach(notify);
	}
	deep--;
}

export function collectCallback(callback: Function, key: any) {
	actionsToDo.set(key, callback);
}