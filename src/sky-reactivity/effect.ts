import { track, untrack } from "./track";

export function effect(key: any, collect: Function, callback: Function) {
	try {
		track(key, callback);
		return collect.call(key);
	} finally {
		untrack();
	}
}