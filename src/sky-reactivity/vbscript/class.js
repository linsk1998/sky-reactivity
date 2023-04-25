import { signal } from "../core/signal";

var seq = 0;
export var TARGET = '@@TARGET';
export var REACTIVE = '@@REACTIVE';

export function createClass(o, reactive, getSignals) {
	var id = ++seq;
	var keys = [];
	var Super = o.constructor;
	if(arguments.length === 1) {
		reactive = returnArg;
	}
	var scripts = [
		'Class VBReactiveClass' + id,
		'	Public [@@TARGET]',
		'	Public [@@WeakMap]',
		'	Public [@@REACTIVE]',
		'	Public [__proto__]',
		'	Public [constructor]'
	];
	for(var key in o) {
		switch(key) {
			case '@@TARGET':
			case '@@WeakMap':
			case '__proto__':
			case 'constructor':
				continue;
		}
		if(Object.prototype.hasOwnProperty.call(o, key) || typeof o[key] !== "function") {
			scripts.push(
				'	Public Property Let [' + key + '](var)',
				'		Call Me.[@@TARGET].[' + key + '].set(var)',
				'	End Property',
				'	Public Property Set [' + key + '](var)',
				'		Call Me.[@@TARGET].[' + key + '].set(Me.[@@REACTIVE](var))',
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
			keys.push(key);
		} else {
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
	return createJsClass(id, keys, Super, reactive, getSignals);
}

function createJsClass(id, keys, Super, reactive, getSignals) {
	var Class = function() {
		var o = window['VBReactiveClassFactory' + id]();
		var target;
		if(getSignals) {
			target = getSignals.call(o, keys);
		} else {
			target = {};
			var i = keys.length;
			while(i--) {
				target[keys[i]] = signal(undefined);
			}
		}
		o[TARGET] = target;
		o[REACTIVE] = reactive;
		o.constructor = Class;
		o.__proto__ = Class.prototype;
		Super.apply(o, arguments);
		return o;
	};
	if(Super && Super !== Object) {
		Object.setPrototypeOf(Class, Super);
		Class.prototype = Object.create(Super.prototype);
	}
	Class.prototype.constructor = Class;
	return Class;
}

export function returnArg(arg1) {
	return arg1;
}