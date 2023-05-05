import { Signal } from "../core/signal";


export function record(o: any, reactive: Function) {
	var keyMap = new Map();
	for(var key in o) {
		keyMap.set(key, new Signal(reactive(o[key], key)));
	}
	return new Proxy(o, {
		get(target, prop, receiver) {
			var box: Signal<any>;
			if(keyMap.has(prop) || process.env.NODE_ENV === "production") {
				box = keyMap.get(prop);
			} else {
				if(process.env.NODE_ENV === "development") {
					console.warn(prop, "is not define. should has default value.");
				}
				box = new Signal();
				keyMap.set(prop, box);
			}
			return box.get();
			// return Reflect.get(target, prop, receiver);
		},
		set(target, prop, value, receiver) {
			var box: Signal<any>;
			if(keyMap.has(prop) || process.env.NODE_ENV === "production") {
				box = keyMap.get(prop);
			} else {
				if(process.env.NODE_ENV === "development") {
					console.warn(prop, "is not define. should has default value.");
				}
				box = new Signal();
				keyMap.set(prop, box);
			}
			value = reactive(value, prop);
			box.set(value);
			return true;
			// return Reflect.set(target, prop, value, receiver);
		}
	});
}
