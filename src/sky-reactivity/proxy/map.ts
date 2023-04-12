import { Signal } from "../core/signal";

const SIGNAL_MAP = Symbol();

class ReactiveMap<K, V> extends Map<K, V> {
	private [SIGNAL_MAP]: Map<K, Signal<V>>;
	public get(key: K): V {
		var box = this[SIGNAL_MAP].get(key);
		if(box) {
			return box.get();
		}
	}
	public set(key: K, value: V): this {
		var box = this[SIGNAL_MAP].get(key);
		if(!box) {
			box = new Signal(value);
			this[SIGNAL_MAP].set(key, box);
		}
		box.set(value);
		super.set(key, value);
		return this;
	}
	public delete(key: K): boolean {
		var box = this[SIGNAL_MAP].get(key);
		if(box) {
			box.set(undefined);
		}
		return super.delete(key);
	}
}

export function map(map) {
	return;
}