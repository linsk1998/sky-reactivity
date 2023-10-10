
var keyStack: any[] = [];
var callbackStack: any[] = [];
var computedStack: any[] = [];
export var currentKey: any;
export var currentCallback: Function;
export var currentComputed: Function;


export function track(key: any, callback: Function) {
	currentKey = key;
	keyStack.push(key);
	currentCallback = callback;
	callbackStack.push(callback);
}

export function untrack() {
	keyStack.pop();
	currentKey = keyStack[keyStack.length - 1];
	callbackStack.pop();
	currentCallback = callbackStack[callbackStack.length - 1];
}

export function effect(key: any, collect: Function, callback: Function) {
	try {
		track(key, callback);
		return collect.call(key);
	} finally {
		untrack();
	}
}
export function effectComputed(key: any, collect: Function, callback: Function) {
	try {
		track(key, callback);
		currentComputed = key;
		computedStack.push(key);
		return collect.call(key);
	} finally {
		untrack();
		computedStack.pop();
		currentComputed = computedStack[computedStack.length - 1];
	}
}