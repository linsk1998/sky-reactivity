export function notify(callback: Function, key: any) {
	callback.call(key);
}