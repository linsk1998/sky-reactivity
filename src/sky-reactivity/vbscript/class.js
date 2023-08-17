import { signal } from "../core/signal";
import { computed } from "../core/computed";
import { batchStart, batchEnd } from "../core/batch";

var seq = 0;
export var TARGET = '@@TARGET';
export var REACTIVE = '@@REACTIVE';

export function createClass(options) {
	var id = ++seq;

	var scripts = [
		'Class VBReactiveClass' + id,
		'	Public [@@TARGET]',
		'	Public [@@WeakMap]',
		'	Public [@@REACTIVE]',
		'	Public [__proto__]',
		'	Public [constructor]'
	];
	var key;
	var members = options.members;
	if(members) {
		for(key in members) {
			scripts.push('	Public [' + key + ']');
		}
	}
	var observables = options.observables;
	if(observables) {
		for(key in observables) {
			scripts.push(
				'	Public Property Let [' + key + '](var)',
				'		Call Me.[@@TARGET].[' + key + '].set(var)',
				'	End Property',
				'	Public Property Set [' + key + '](var)',
				'		Call Me.[@@TARGET].[' + key + '].set(Me.[@@REACTIVE](var,"' + key + '"))',
				'	End Property',
				'	Public Property Get [' + key + ']',
				'		On Error Resume Next',
				'		Set [' + key + '] = Me.[@@TARGET].[' + key + '].get()',
				'		If Err.Number <> 0 Then',
				'			[' + key + '] = Me.[@@TARGET].[' + key + '].get()',
				'		End If',
				'		On Error Goto 0',
				'	End Property'
			);
		}
	}
	var accessors = options.accessors;
	if(accessors) {
		for(key in accessors) {
			var desc = accessors[key];
			scripts.push(
				'	Public [@@desc:' + key + ']'
			);
			if(desc.set) {
				scripts.push(
					'	Public Property Let [' + key + '](var)',
					'		Call Me.[@@desc:' + key + '].set.call(Me, var)',
					'	End Property',
					'	Public Property Set [' + key + '](var)',
					'		Call Me.[@@desc:' + key + '].set.call(Me, var)',
					'	End Property'
				);
			}
			if(desc.get) {
				scripts.push(
					'	Public Property Get [' + key + ']',
					'		On Error Resume Next',
					'		Set [' + key + '] = Me.[@@desc:' + key + '].get.call(Me)',
					'		If Err.Number <> 0 Then',
					'			[' + key + '] = Me.[@@desc:' + key + '].get.call(Me)',
					'		End If',
					'		On Error Goto 0',
					'	End Property'
				);
			}
		}
	}
	var computed = options.computed;
	if(computed) {
		for(key in computed) {
			var desc = computed[key];
			if(desc.set) {
				scripts.push(
					'	Public Property Let [' + key + '](var)',
					'		Call Me.[@@TARGET].[' + key + '].set(var)',
					'	End Property',
					'	Public Property Set [' + key + '](var)',
					'		Call Me.[@@TARGET].[' + key + '].set(Me.[@@REACTIVE](var,"' + key + '"))',
					'	End Property'
				);
			}
			if(desc.get) {
				scripts.push(
					'	Public Property Get [' + key + ']',
					'		On Error Resume Next',
					'		Set [' + key + '] = Me.[@@TARGET].[' + key + '].get()',
					'		If Err.Number <> 0 Then',
					'			[' + key + '] = Me.[@@TARGET].[' + key + '].get()',
					'		End If',
					'		On Error Goto 0',
					'	End Property'
				);
			}
		}
	}
	var methods = options.methods;
	if(methods) {
		for(key in methods) {
			scripts.push('	Public [' + key + ']');
		}
	}
	var batches = options.batches;
	if(batches) {
		for(key in batches) {
			scripts.push('	Public [' + key + ']');
		}
	}
	scripts = scripts.concat([
		'End Class',
		'Function VBReactiveClassFactory' + id + '()',
		'	Set VBReactiveClassFactory' + id + ' = New VBReactiveClass' + id,
		'End Function'
	]);
	window.execScript(scripts.join('\n'), 'VBScript');
	return createJsClass(id, options);
}

function createJsClass(id, options) {
	var Super = options['super'];
	var reactive = options.reactive || returnArg;
	var Class = function() {
		var o = window['VBReactiveClassFactory' + id]();
		var key;
		var accessors = options.accessors;
		if(accessors) {
			for(key in accessors) {
				o["@@desc:" + key] = accessors[key];
			}
		}
		var target = o[TARGET] = {};
		o[REACTIVE] = reactive;
		var observables = options.observables;
		if(observables) {
			for(key in observables) {
				target[key] = signal(observables[key]);
			}
		}
		var com = options.computed;
		if(com) {
			for(key in com) {
				var desc = com[key];
				var getter = desc.get;
				var setter = desc.set;
				target[key] = computed(getter.bind(o), setter && setter.bind(o));
			}
		}
		var methods = options.methods;
		if(methods) {
			for(key in methods) {
				o[key] = methods[key].bind(o);
			}
		}
		var batches = options.batches;
		if(batches) {
			var keys = Object.keys(batches);
			keys.forEach(function(key) {
				var fn = batches[key];
				this[key] = function() {
					try {
						batchStart();
						fn.apply(o, arguments);
					} catch(e) {
						console.error(e);
					} finally {
						batchEnd();
					}
				};
			}, o);
		}
		o.constructor = Class;
		o.__proto__ = Class.prototype;
		if(Super && Super !== Object) {
			Super.apply(o, arguments);
		}
		return o;
	};
	if(Super && Super !== Object) {
		Class.prototype = Object.create(Super.prototype);
		Object.setPrototypeOf(Class, Super);
	}
	Class.prototype.constructor = Class;
	return Class;
}

export function returnArg(arg1) {
	return arg1;
}
