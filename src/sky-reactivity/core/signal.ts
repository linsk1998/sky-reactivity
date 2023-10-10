import { collectCallback, deep } from "./batch";
import { notify } from "./notify";
import { relation } from "./stop";
import { currentCallback, currentKey, currentComputed } from "./effect";
import type { Computed } from "./computed";

export class Signal<T>{
	protected _callbacks = new Map<any, Function>();
	protected _computeds = new Set<Computed<any>>();
	public value: T;
	constructor(initValue?: T) {
		this.value = initValue;
	}
	public get(): T {
		if(currentComputed) {
			this._computeds.add(currentKey);
		}
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
		this._computeds.forEach(reset);
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
		this._computeds.delete(key);
		this._callbacks.delete(key);
	}
}

function reset(computed: Computed<any>) {
	computed.reset();
}

export function signal<T>(initValue: T): Signal<T> {
	return new Signal(initValue);
}
