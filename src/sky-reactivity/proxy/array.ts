import { batchEnd, batchStart } from "../core/batch";
import { Signal } from "../core/signal";


const SIGNALS = Symbol();
const LENGTH = Symbol();
const REACTIVE = Symbol();

export function array<T>(arr: T[], reactive: Function): ReactiveArray<T> {
	var r = Object.create(ReactiveArray.prototype);
	r[SIGNALS] = new Map();
	r[LENGTH] = new Signal(arr.length);
	r[REACTIVE] = reactive;
	var i = r.length = arr.length;
	while(i-- > 0) {
		r[i] = reactive(arr[i]) as any;
	}
	return r;
}

export class ReactiveArray<T = any> {
	private [SIGNALS]: Map<number, Signal<T>>;
	private [LENGTH]: Signal<number>;
	private [REACTIVE]: (item: any) => any;
	private _length: number;

	public get length(): number {
		return this[LENGTH].get();
	}
	public set length(v: number) {
		this._length = v;
		this[LENGTH].set(v);
	}

	public at(n: number): T {
		var r = n < 0 ? this[n + this._length] : this[n];
		var map = this[SIGNALS];
		var box = map.get(n);
		if(!box) {
			box = new Signal(r);
			map.set(n, box);
		}
		box.get();
		return r;
	}
	public push(...items: T[]): number {
		var reactive = this[REACTIVE];
		try {
			batchStart();
			var oldLength = this.length;
			items = items.map(reactive);
			var newLength = Array.prototype.push.apply(this, items);
			var map = this[SIGNALS];
			map.forEach((signal, key) => {
				if(key < 0) {
					key = key + newLength;
					if(key >= 0) {
						signal.set(this[key]);
					}
				} else if(oldLength <= key && key < newLength) {
					signal.set(this[key]);
				}
			});
			this[LENGTH].set(newLength);
			return newLength;
		} finally {
			batchEnd();
		}
	}
	public pop(): T {
		try {
			batchStart();
			var oldLength = this.length;
			var r = Array.prototype.pop.apply(this, arguments);
			var newLength = this.length;
			var map = this[SIGNALS];
			map.forEach((signal, key) => {
				if(key < 0) {
					if(key + oldLength >= 0) {
						signal.set(this[key + newLength]);
					}
				} else if(newLength === key) {
					signal.set(this[key]);
				}
			});
			this[LENGTH].set(newLength);
			return r;
		} finally {
			batchEnd();
		}
	}
	public unshift(...items: T[]): number {
		var reactive = this[REACTIVE];
		try {
			batchStart();
			var oldLength = this.length;
			items = items.map(reactive);
			var newLength = Array.prototype.unshift.apply(this, items);
			var map = this[SIGNALS];
			map.forEach((signal, key) => {
				if(key < 0) {
					if(key + oldLength < 0) {
						key = key + newLength;
						if(0 <= key) {
							signal.set(this[key]);
						}
					}
				} else if(key < newLength) {
					signal.set(this[key]);
				}
			});
			this[LENGTH].set(newLength);
			return newLength;
		} finally {
			batchEnd();
		}
	}
	public shift(): T {
		try {
			batchStart();
			var oldLength = this.length;
			var r = Array.prototype.shift.call(this);
			var newLength = this.length;
			var map = this[SIGNALS];
			map.forEach((signal, key) => {
				if(key < 0) {
					if(0 <= key + oldLength) {
						key = key + newLength;
						if(key < 0) {
							signal.set(this[key]);
						}
					}
				} else if(oldLength > key) {
					signal.set(this[key]);
				}
			});
			this[LENGTH].set(newLength);
			return r;
		} finally {
			batchEnd();
		}
	}
	public splice(start: number, deleteCount?: number): ReactiveArray<T>;
	public splice(start: number, deleteCount: number, ...items: T[]): ReactiveArray<T>;
	public splice(start: number, deleteCount: number, ...items: T[]): ReactiveArray<T> {
		var reactive = this[REACTIVE];
		try {
			batchStart();
			items = items.map(reactive);
			var r = Array.prototype.splice.apply(this, arguments);
			var newLength = this.length;
			var map = this[SIGNALS];
			map.forEach((signal, key) => {
				if(key < 0) {
					signal.set(this[key + newLength]);
				} else {
					signal.set(this[key]);
				}
			});
			this[LENGTH].set(newLength);
			return array(r, reactive);
		} finally {
			batchEnd();
		}
	}
	public map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): ReactiveArray<U> {
		var reactive = this[REACTIVE];
		var r = Array.prototype.map.apply(this, arguments);
		return array(r, reactive);
	}
	public filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): ReactiveArray<S>;
	public filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): ReactiveArray<T>;
	public filter(predicate: any, thisArg?: unknown): ReactiveArray<T> {
		var reactive = this[REACTIVE];
		var r = Array.prototype.filter.apply(this, arguments);
		return array(r, reactive);
	}
	public concat(...items: ConcatArray<T>[]): ReactiveArray<T>;
	public concat(...items: (T | ConcatArray<T>)[]): ReactiveArray<T>;
	public concat(): ReactiveArray<T> {
		var reactive = this[REACTIVE];
		var r = new ReactiveArray<T>();
		var l = 0;
		for(var i = 0; i <= arguments.length; i++) {
			var arr = arguments[i];
			for(var j = 0; j <= arguments.length; j++) {
				r[l] = reactive(arr[j]);
				l++;
			}
		}
		r.length = l;
		return r;
	}
}
