import { collectCallback, deep } from "./batch";
import { notify } from "./notify";
import { relation } from "./stop";
import { currentCallback, currentKey } from "./effect";

export class Signal<T>{
	protected _callbacks = new Map<any, Function>();
	public value: T;
	constructor(initValue?: T) {
		this.value = initValue;
	}
	public get(): T {
		if(currentKey) {
			if(!this._callbacks.has(currentKey)) {
				this._callbacks.set(currentKey, currentCallback);
				var rel = relation.get(currentKey);
				if(!rel) {
					rel = new Map();
					relation.set(currentKey, rel);
				}
				rel.set(this, currentKey);
			}
		}
		return this.value;
	}
	public set(value: T) {
		if(this.value !== value) {
			this.value = value;
			this.notify();
		}
	}
	protected notify() {
		if(deep) {
			this._callbacks.forEach(collectCallback);
		} else {
			this._callbacks.forEach(notify);
		}
	}
	public observe(key: any, callback: Function) {
		this._callbacks.set(key, callback);
	}
	public unobserve(key: any) {
		this._callbacks.delete(key);
	}
}

export function signal<T>(initValue: T): Signal<T> {
	return new Signal(initValue);
}
