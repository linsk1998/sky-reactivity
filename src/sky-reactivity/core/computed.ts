import { effect } from "./effect";
import { Signal } from "./signal";
import { stop } from "./stop";

export class Computed<T> extends Signal<T> {
	protected getter: () => T;
	protected setter?: (value: T) => void;
	protected hasCache = false;
	constructor(getter: () => T, setter?: (value: T) => void) {
		super();
		this.getter = getter;
		this.setter = setter;
	}
	public get(): T {
		if(this.hasCache) {
			return super.get();
		}
		stop(this);
		this.value = effect(this, this.getter, this.onChange);
		this.hasCache = true;
		return super.get();
	}
	protected onChange() {
		this.hasCache = false;
		this.notify();
	}
	public set(value: T) {
		if(this.setter) {
			this.setter(value);
		} else {
			throw new TypeError("This computed is Readonly.");
		}
	}
}

export function computed<T>(getter: () => T, setter?: (value: T) => void): Computed<T> {
	return new Computed(getter, setter);
}