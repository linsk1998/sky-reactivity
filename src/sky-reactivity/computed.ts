import { effect } from "./effect";
import { Observable } from "./observable";
import { stop } from "./stop";

export class Computed<T> extends Observable<T> {
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
		this._value = effect(this, this.getter, this.onChange);
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