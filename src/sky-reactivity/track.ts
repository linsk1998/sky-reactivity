
var keyStack: any[] = [];
var callbackStack: any[] = [];
export var currentKey: any;
export var currentCallback: Function;


export function track(key: any, callback: Function) {
	currentKey = key;
	currentCallback = callback;
	keyStack.push(key);
	callbackStack.push(callback);
}

export function untrack() {
	keyStack.pop();
	callbackStack.pop();
	currentKey = keyStack[keyStack.length - 1];
	currentCallback = callbackStack[callbackStack.length - 1];
}