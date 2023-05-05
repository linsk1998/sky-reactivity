import { batchEnd, batchStart } from "../core/batch";
import { Signal } from "../core/signal";


const SIGNALS = Symbol();
const SIGNAL = Symbol();
const LENGTH = Symbol();
const REACTIVE = Symbol();

export function array<T>(arr: T[], reactive: Function): ReactiveArray<T> {
	var i = arr.length;
	var r = Object.create(ReactiveArray.prototype);
	r[SIGNALS] = new Map();
	r[SIGNAL] = new Signal(false);
	r[LENGTH] = new Signal(i);
	r[REACTIVE] = reactive;
	while(i-- > 0) {
		r[i] = reactive(arr[i], i) as any;
	}
	return r;
}

export class ReactiveArray<T = any> extends Array {
	private [SIGNALS]: Map<number, Signal<T>>;
	private [LENGTH]: Signal<number>;
	private [REACTIVE]: (item: any) => any;

	public get length(): number {
		return this[LENGTH].get();
	}
	public set length(v: number) {
		this[LENGTH].set(v);
	}

	public at(n: number): T {
		var r = n < 0 ? this[n + this[LENGTH].value] : this[n];
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
			var s = this[SIGNAL];
			s.set(!s.get());
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
			var s = this[SIGNAL];
			s.set(!s.get());
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
			var s = this[SIGNAL];
			s.set(!s.get());
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
			var s = this[SIGNAL];
			s.set(!s.get());
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
			var s = this[SIGNAL];
			s.set(!s.get());
			return array(r, reactive);
		} finally {
			batchEnd();
		}
	}
	public map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): ReactiveArray<U> {
		this[SIGNAL].get();
		return Array.prototype.map.apply(this, arguments);
	}
	public filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): ReactiveArray<S>;
	public filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): ReactiveArray<T>;
	public filter(predicate: any, thisArg?: unknown): ReactiveArray<T> {
		this[SIGNAL].get();
		return Array.prototype.filter.apply(this, arguments);
	}
	public concat(...items: ConcatArray<T>[]): ReactiveArray<T>;
	public concat(...items: (T | ConcatArray<T>)[]): ReactiveArray<T>;
	public concat(): ReactiveArray<T> {
		this[SIGNAL].get();
		return Array.prototype.concat.apply(this, arguments);
	}
}
