import { collectCallback, deep } from "./action";
import { notify } from "./notify";
import { relation } from "./stop";
import { currentCallback, currentKey } from "./track";

export class Observable<T>{
	protected _callbacks = new Map<any, Function>();
	protected _value: T;
	constructor(initValue?: T) {
		this._value = initValue;
	}
	public get(): T {
		if(currentKey) {
			this._callbacks.set(currentKey, currentCallback);
			var rel = relation.get(currentKey);
			if(!rel) {
				rel = new Map();
				relation.set(currentKey, rel);
			}
			rel.set(this, currentKey);
		}
		return this._value;
	}
	public set(value: T) {
		this._value = value;
		this.notify();
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

export function observable<T>(initValue: T): Observable<T> {
	return new Observable(initValue);
}