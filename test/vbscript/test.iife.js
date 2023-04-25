(function () {
	'use strict';

	var KEY_WM = "@@WeakMap";
	var weakSeq = 0;
	function WeakMap$1() {
	  this.symbol = weakSeq++;
	  if (arguments.length) {
	    var iterable = arguments[0];
	    var entries = iterable[Symbol.iterator];
	    if (entries) {
	      var it = entries.call(iterable);
	      while (true) {
	        var next = it.next();
	        if (next.done) break;
	        try {
	          this.set(next.value[0], next.value[1]);
	        } catch (e) {
	          if (it["return"]) {
	            try {
	              it["return"]();
	            } catch (e) {}
	          }
	          throw e;
	        }
	      }
	    }
	  }
	}
	WeakMap$1.prototype.set = function (key, value) {
	  if (typeof key !== "object" && typeof key !== "function") {
	    throw new TypeError("Invalid value used in weak");
	  }
	  var map = key[KEY_WM];
	  if (!map) {
	    map = key[KEY_WM] = {};
	  }
	  map[this.symbol] = value;
	  return this;
	};
	WeakMap$1.prototype.get = function (key) {
	  var map = key[KEY_WM];
	  if (map) {
	    return map[this.symbol];
	  }
	};
	WeakMap$1.prototype.has = function (key) {
	  var map = key[KEY_WM];
	  if (map) {
	    return this.symbol in map;
	  }
	  return false;
	};
	WeakMap$1.prototype["delete"] = function (key) {
	  if (typeof key !== "object" && typeof key !== "function") {
	    return false;
	  }
	  var map = key[KEY_WM];
	  if (map) {
	    if (this.symbol in map) {
	      delete map[this.symbol];
	      return false;
	    }
	  }
	  return false;
	};

	if (!window.WeakMap) {
	  window.WeakMap = WeakMap$1;
	}

	var Object$1 = window.Object;

	var dontEnums = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable"];

	// from core-js
	var GT = '>';
	var LT = '<';
	var SCRIPT = 'script';
	function scriptTag(content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	}

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	function NullProtoObjectViaActiveX(activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	}

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	function NullProtoObjectViaIFrame() {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	}

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject -- old IE */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) {/* ignore */}
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var i = dontEnums.length;
	  while (i--) delete NullProtoObject.prototype[dontEnums[i]];
	  return NullProtoObject();
	};

	function isJsObject(o) {
	  if (typeof o !== "object") {
	    return false;
	  }
	  if (o instanceof Object) {
	    return true;
	  }
	  if (o instanceof NullProtoObject) {
	    return true;
	  }
	  return false;
	}

	var hasEnumBug = !{
	  toString: null
	}.propertyIsEnumerable('toString');

	function getPrototypeOf(obj) {
	  if (obj == null) {
	    throw new TypeError("Cannot convert undefined or null to object");
	  }
	  if (typeof obj !== "object") {
	    obj = Object(obj);
	  }
	  if ('__proto__' in obj) {
	    return obj.__proto__;
	  }
	  if (!('constructor' in obj)) {
	    return null;
	  }
	  if (Object.prototype.hasOwnProperty.call(obj, 'constructor')) {
	    if ('__proto__' in obj.constructor) {
	      return obj.constructor.__proto__.prototype;
	    } else if (obj === Object.prototype) {
	      return null;
	    } else {
	      return Object.prototype;
	    }
	  }
	  return obj.constructor.prototype;
	}
	getPrototypeOf.sham = true;

	function keys$1(obj) {
	  if (obj == null) {
	    throw new TypeError("Cannot convert undefined or null to object");
	  }
	  var result = [],
	    key;
	  var jsObject = isJsObject(obj);
	  if (!jsObject) {
	    var proto = getPrototypeOf(obj);
	    if (proto) {
	      for (key in obj) {
	        switch (key.substring(0, 2)) {
	          case "__":
	          case "@@":
	            continue;
	        }
	        if (proto[key] !== obj[key]) {
	          result.push(key);
	        }
	      }
	      return result;
	    }
	  }
	  for (key in obj) {
	    switch (key.substring(0, 2)) {
	      case "__":
	      case "@@":
	        continue;
	    }
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      var desc = obj["@@desc:" + key];
	      if (!desc || desc.enumerable) {
	        result.push(key);
	      }
	    }
	  }
	  if (hasEnumBug) {
	    var i = dontEnums.length;
	    while (i-- > 0) {
	      key = dontEnums[i];
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        result.push(key);
	      }
	    }
	  }
	  return result;
	}

	if (!Object$1.keys) {
	  Object$1.keys = keys$1;
	}

	var Array$1 = window.Array;

	function isArray(obj) {
	  return Object.prototype.toString.call(obj) === '[object Array]';
	}

	if (!Array$1.isArray) {
	  Array$1.isArray = isArray;
	}

	function map$1(fn) {
	  var thisArg = arguments[1];
	  var arr = [];
	  for (var k = 0, length = this.length; k < length; k++) {
	    arr.push(fn.call(thisArg, this[k], k, this));
	  }
	  return arr;
	}

	if (!Array.prototype.map) {
	  Array.prototype.map = map$1;
	}

	function forEach$1(callback) {
	  var thisArg = arguments[1];
	  for (var i = 0; i < this.length; i++) {
	    if (i in this) {
	      callback.call(thisArg, this[i], i, this);
	    }
	  }
	}

	if (!Array.prototype.forEach) {
	  Array.prototype.forEach = forEach$1;
	}

	function fill(target) {
	  if (this.length <= 0) {
	    return this;
	  }
	  var len = this.length;
	  var start = arguments[1] || 0;
	  var end = arguments[2] || len;
	  if (start < 0) {
	    start += len;
	    if (start < 0) {
	      start = 0;
	    }
	  }
	  if (end < 0) {
	    end += len;
	  }
	  var i = Math.min(end, len);
	  while (i-- > start) {
	    this[i] = target;
	  }
	  return this;
	}

	if (!Array.prototype.fill) {
	  Array.prototype.fill = fill;
	}

	var Map$1 = window.Map;

	var isNaN$2 = window.isNaN;

	function isNaN$1(value) {
	  return typeof value === "number" && isNaN$2(value);
	}

	var isNaN = Number.isNaN || isNaN$1;

	function createMap() {
	  function Map() {
	    var arr = arguments[0];
	    this.size = 0;
	    this.head = null;
	    this.tail = null;
	    if (arr) {
	      var entries = arr['@@iterator'];
	      if (entries) {
	        var it = entries.call(arr);
	        while (true) {
	          var next = it.next();
	          if (next.done) break;
	          try {
	            this.set(next.value[0], next.value[1]);
	          } catch (e) {
	            if (it["return"]) {
	              try {
	                it["return"]();
	              } catch (e) {}
	            }
	            throw e;
	          }
	        }
	      }
	    }
	  }
	  Map.prototype.has = has;
	  Map.prototype.get = get;
	  Map.prototype.set = set;
	  Map.prototype["delete"] = remove;
	  Map.prototype.clear = clear;
	  Map.prototype.forEach = forEach;
	  Map.prototype.entries = entries;
	  Map.prototype.keys = keys;
	  Map.prototype.values = values;
	  Map.prototype['@@iterator'] = entries;
	  return Map;
	}
	function has(key) {
	  if (this.size === 0) {
	    return false;
	  }
	  var item = this.head;
	  while (item) {
	    if (item.key === key || isNaN(key) && isNaN(item.key)) {
	      return true;
	    }
	    item = item.next;
	  }
	  return false;
	}
	function get(key) {
	  if (this.size === 0) {
	    return undefined;
	  }
	  var item = this.head;
	  while (item) {
	    if (item.key === key || isNaN(key) && isNaN(item.key)) {
	      return item.value;
	    }
	    item = item.next;
	  }
	  return undefined;
	}
	function set(key, value) {
	  if (key === 0) {
	    //-0 -> 0
	    key = 0;
	  }
	  if (this.size === 0) {
	    this.head = this.tail = {
	      key: key,
	      value: value,
	      prev: null,
	      next: null,
	      exist: true
	    };
	    this.size = 1;
	    return this;
	  }
	  var item = this.head;
	  while (item) {
	    if (item.key === key || isNaN(key) && isNaN(item.key)) {
	      item.value = value;
	      return this;
	    }
	    item = item.next;
	  }
	  var tail = this.tail;
	  var newTail = {
	    key: key,
	    value: value,
	    prev: tail,
	    next: null,
	    exist: true
	  };
	  tail.next = newTail;
	  this.tail = newTail;
	  this.size++;
	  return this;
	}
	function remove(key) {
	  if (this.size === 0) {
	    return false;
	  }
	  var item = this.head;
	  while (item) {
	    if (item.key === key || isNaN(key) && isNaN(item.key)) {
	      var prev = item.prev;
	      var next = item.next;
	      if (prev) {
	        prev.next = next;
	      } else {
	        this.head = next;
	      }
	      if (next) {
	        next.prev = prev;
	      } else {
	        this.tail = prev;
	      }
	      item.exist = false;
	      this.size--;
	      return true;
	    }
	    item = item.next;
	  }
	  return false;
	}
	function clear() {
	  this.size = 0;
	  this.head = null;
	  this.tail = null;
	}
	function forEach(callbackfn) {
	  var thisArg = arguments[1];
	  var item = this.head;
	  while (item) {
	    callbackfn.call(thisArg, item.value, item.key, this);
	    var next = item.next;
	    if (item.exist || next && next.exist) {
	      item = next;
	    } else {
	      while (true) {
	        item = item.prev;
	        if (item) {
	          if (item.exist) {
	            item = item.next;
	            break;
	          }
	        } else {
	          item = this.head;
	          break;
	        }
	      }
	    }
	  }
	}
	function createIterable(that, getValue) {
	  var done = false;
	  var current;
	  var it = {
	    next: function () {
	      var value;
	      if (done) {
	        return {
	          done: done,
	          value: value
	        };
	      }
	      if (!current) {
	        current = that.head;
	      } else {
	        var next = current.next;
	        if (current.exist || next && next.exist) {
	          current = next;
	        } else {
	          while (true) {
	            current = current.prev;
	            if (current) {
	              if (current.exist) {
	                current = current.next;
	                break;
	              }
	            } else {
	              current = that.head;
	              break;
	            }
	          }
	        }
	      }
	      if (current) {
	        done = false;
	        value = getValue(current);
	      } else {
	        done = true;
	      }
	      return {
	        done: done,
	        value: value
	      };
	    }
	  };
	  it['@@iterator'] = function () {
	    return createIterable(that, getValue);
	  };
	  return it;
	}
	function getKeyValue(item) {
	  return [item.key, item.value];
	}
	function entries() {
	  return createIterable(this, getKeyValue);
	}
	function getKey(item) {
	  return item.key;
	}
	function keys() {
	  return createIterable(this, getKey);
	}
	function getValue(item) {
	  return item.value;
	}
	function values() {
	  return createIterable(this, getValue);
	}

	if (!Map$1) {
	  window.Map = createMap();
	}

	var slice = Array.prototype.slice;

	if (!Function.prototype.bind) {
	  Function.prototype.bind = function (context) {
	    var self = this,
	      args = slice.call(arguments, 1);
	    return function () {
	      return self.apply(context, args.concat(slice.call(arguments)));
	    };
	  };
	}

	function _notify(callback, key) {
	  callback.call(key);
	}
	var deep = 0;
	var actionsToDo = new Map();
	function batchStart() {
	  deep++;
	}
	function batchEnd() {
	  if (deep === 1) {
	    try {
	      actionsToDo.forEach(_notify);
	    } catch (e) {
	      console.error(e);
	    } finally {
	      actionsToDo.clear();
	    }
	  }
	  deep--;
	}
	function collectCallback(callback, key) {
	  actionsToDo.set(key, callback);
	}
	var relation = new WeakMap();
	var keyStack = [];
	var callbackStack = [];
	var currentKey;
	var currentCallback;
	function track(key, callback) {
	  currentKey = key;
	  currentCallback = callback;
	  keyStack.push(key);
	  callbackStack.push(callback);
	}
	function untrack() {
	  keyStack.pop();
	  callbackStack.pop();
	  currentKey = keyStack[keyStack.length - 1];
	  currentCallback = callbackStack[callbackStack.length - 1];
	}
	function effect(key, collect, callback) {
	  try {
	    track(key, callback);
	    return collect.call(key);
	  } finally {
	    untrack();
	  }
	}
	var Signal = /*#__PURE__*/function () {
	  function Signal(initValue) {
	    this._callbacks = new Map();
	    this.value = initValue;
	  }
	  var _proto = Signal.prototype;
	  _proto.get = function () {
	    function get() {
	      if (currentKey) {
	        this._callbacks.set(currentKey, currentCallback);
	        var rel = relation.get(currentKey);
	        if (!rel) {
	          rel = new Map();
	          relation.set(currentKey, rel);
	        }
	        rel.set(this, currentKey);
	      }
	      return this.value;
	    }
	    return get;
	  }();
	  _proto.set = function () {
	    function set(value) {
	      if (this.value !== value) {
	        this.value = value;
	        this.notify();
	      }
	    }
	    return set;
	  }();
	  _proto.notify = function () {
	    function notify() {
	      if (deep) {
	        this._callbacks.forEach(collectCallback);
	      } else {
	        this._callbacks.forEach(_notify);
	      }
	    }
	    return notify;
	  }();
	  _proto.observe = function () {
	    function observe(key, callback) {
	      this._callbacks.set(key, callback);
	    }
	    return observe;
	  }();
	  _proto.unobserve = function () {
	    function unobserve(key) {
	      this._callbacks["delete"](key);
	    }
	    return unobserve;
	  }();
	  return Signal;
	}();
	function signal(initValue) {
	  return new Signal(initValue);
	}
	var TARGET$1 = '@@TARGET';
	var SIGNALS = '@@SIGNALS';
	var LENGTH$1 = '@@LENGTH';
	var REACTIVE$1 = '@@REACTIVE';
	window.execScript(['Class VBReactiveArray', '	Public [@@TARGET]', '	Public [@@LENGTH]', '	Public [@@SIGNALS]', '	Public [@@REACTIVE]', '	Public [@@WeakMap]', '	Public [__proto__]', '	Public [constructor]', '	Public Property Let [length](var)', '		Call Me.[@@LENGTH].set(var)', '		Me.[@@TARGET].length = var', '	End Property', '	Public Property Get [length]', '		[length] = Me.[@@LENGTH].get()', '	End Property', '	Public [at]', '	Public [push]', '	Public [pop]', '	Public [unshift]', '	Public [shift]', '	Public [splice]', '	Public [map]', '	Public [filter]', '	Public [concat]', 'End Class', 'Function VBReactiveArrayFactory()', '	Set VBReactiveArrayFactory = New VBReactiveArray', 'End Function'].join('\n'), 'VBScript');
	function array(arr, reactive) {
	  var i = arr.length;
	  var r = ReactiveArray();
	  var target = r[TARGET$1] = new Array(i);
	  r[SIGNALS] = new Map();
	  r[LENGTH$1] = signal(i);
	  r[REACTIVE$1] = reactive;
	  while (i-- > 0) {
	    target[i] = reactive(arr[i]);
	  }
	  return r;
	}
	function ReactiveArray(length) {
	  var r = VBReactiveArrayFactory();
	  r[SIGNALS] = new Map();
	  r[LENGTH$1] = signal(length);
	  r.__proto__ = ReactiveArray.prototype;
	  r.constructor = ReactiveArray;
	  r.at = at.bind(r);
	  r.push = push.bind(r);
	  r.pop = pop.bind(r);
	  r.unshift = unshift.bind(r);
	  r.shift = shift.bind(r);
	  r.splice = splice.bind(r);
	  r.map = map.bind(r);
	  r.filter = filter.bind(r);
	  r.concat = concat.bind(r);
	  return r;
	}
	ReactiveArray.prototype.at = at;
	ReactiveArray.prototype.push = push;
	ReactiveArray.prototype.pop = pop;
	ReactiveArray.prototype.unshift = unshift;
	ReactiveArray.prototype.shift = shift;
	ReactiveArray.prototype.splice = splice;
	ReactiveArray.prototype.map = map;
	ReactiveArray.prototype.filter = filter;
	ReactiveArray.prototype.concat = concat;
	function at(n) {
	  var target = this[TARGET$1];
	  var r = n < 0 ? target[n + this[LENGTH$1].value] : target[n];
	  var map = this[SIGNALS];
	  var box = map.get(n);
	  if (!box) {
	    box = signal(r);
	    map.set(n, box);
	  }
	  box.get();
	  return r;
	}
	function push() {
	  var reactive = this[REACTIVE$1];
	  try {
	    batchStart();
	    var oldLength = this.length;
	    var items = Array.prototype.slice.call(arguments);
	    items = items.map(reactive);
	    var target = this[TARGET$1];
	    var newLength = Array.prototype.push.apply(target, items);
	    var map = this[SIGNALS];
	    map.forEach(function (signal, key) {
	      if (key < 0) {
	        key = key + newLength;
	        if (key >= 0) {
	          signal.set(target[key]);
	        }
	      } else if (oldLength <= key && key < newLength) {
	        signal.set(target[key]);
	      }
	    });
	    this[LENGTH$1].set(newLength);
	    return newLength;
	  } finally {
	    batchEnd();
	  }
	}
	function pop() {
	  try {
	    batchStart();
	    var oldLength = this.length;
	    var target = this[TARGET$1];
	    Array.prototype.pop.call(target);
	    var newLength = target.length;
	    var map = this[SIGNALS];
	    map.forEach(function (signal, key) {
	      if (key < 0) {
	        if (key + oldLength >= 0) {
	          signal.set(target[key + newLength]);
	        }
	      } else if (newLength === key) {
	        signal.set(target[key]);
	      }
	    });
	    this[LENGTH$1].set(newLength);
	    return newLength;
	  } finally {
	    batchEnd();
	  }
	}
	function unshift() {
	  var reactive = this[REACTIVE$1];
	  try {
	    batchStart();
	    var oldLength = this.length;
	    var args = [],
	      len = arguments.length;
	    for (var i = 0; i < len; i++) {
	      args[i] = reactive(arguments[i]);
	    }
	    var target = this[TARGET$1];
	    var r = Array.prototype.unshift.apply(target, args);
	    var newLength = target.length;
	    var map = this[SIGNALS];
	    map.forEach(function (signal, key) {
	      if (key < 0) {
	        if (key + oldLength < 0) {
	          key = key + newLength;
	          if (0 <= key) {
	            signal.set(target[key]);
	          }
	        }
	      } else if (key < newLength) {
	        signal.set(target[key]);
	      }
	    });
	    this[LENGTH$1].set(newLength);
	    return r;
	  } finally {
	    batchEnd();
	  }
	}
	function shift() {
	  try {
	    batchStart();
	    var oldLength = this.length;
	    var target = this[TARGET$1];
	    var r = Array.prototype.shift.call(target);
	    var newLength = target.length;
	    var map = this[SIGNALS];
	    map.forEach(function (signal, key) {
	      if (key < 0) {
	        if (0 <= key + oldLength) {
	          key = key + newLength;
	          if (key < 0) {
	            signal.set(target[key]);
	          }
	        }
	      } else if (oldLength > key) {
	        signal.set(target[key]);
	      }
	    });
	    this[LENGTH$1].set(newLength);
	    return r;
	  } finally {
	    batchEnd();
	  }
	}
	function splice() {
	  var reactive = this[REACTIVE$1];
	  try {
	    batchStart();
	    var args = [],
	      len = arguments.length;
	    for (var i = 0; i < len; i++) {
	      args[i] = i > 1 ? reactive(arguments[i]) : arguments[i];
	    }
	    var target = this[TARGET$1];
	    var r = Array.prototype.splice.apply(target, args);
	    var newLength = target.length;
	    var map = this[SIGNALS];
	    map.forEach(function (signal, key) {
	      if (key < 0) {
	        signal.set(target[key + newLength]);
	      } else {
	        signal.set(target[key]);
	      }
	    });
	    this[LENGTH$1].set(newLength);
	    return array(r, reactive);
	  } finally {
	    batchEnd();
	  }
	}
	function map() {
	  var reactive = this[REACTIVE$1];
	  var target = this[TARGET$1];
	  var r = Array.prototype.map.apply(target, arguments);
	  return array(r, reactive);
	}
	function filter() {
	  var reactive = this[REACTIVE$1];
	  var target = this[TARGET$1];
	  var r = Array.prototype.filter.apply(target, arguments);
	  return array(r, reactive);
	}
	function concat() {
	  var reactive = this[REACTIVE$1];
	  var r = ReactiveArray();
	  var target = r[TARGET$1];
	  var l = 0;
	  for (var i = 0; i <= arguments.length; i++) {
	    var arr = arguments[i];
	    for (var j = 0; j <= arguments.length; j++) {
	      target[l] = reactive(arr[j]);
	      l++;
	    }
	  }
	  r.length = l;
	  return r;
	}
	var seq = 0;
	var TARGET = '@@TARGET';
	var REACTIVE = '@@REACTIVE';
	function createClass(o, reactive, getSignals) {
	  var id = ++seq;
	  var keys = [];
	  var Super = o.constructor;
	  if (arguments.length === 1) {
	    reactive = returnArg;
	  }
	  var scripts = ['Class VBReactiveClass' + id, '	Public [@@TARGET]', '	Public [@@WeakMap]', '	Public [@@REACTIVE]', '	Public [__proto__]', '	Public [constructor]'];
	  for (var key in o) {
	    switch (key) {
	      case '@@TARGET':
	      case '@@WeakMap':
	      case '__proto__':
	      case 'constructor':
	        continue;
	    }
	    if (Object.prototype.hasOwnProperty.call(o, key) || typeof o[key] !== "function") {
	      scripts.push('	Public Property Let [' + key + '](var)', '		Call Me.[@@TARGET].[' + key + '].set(var)', '	End Property', '	Public Property Set [' + key + '](var)', '		Call Me.[@@TARGET].[' + key + '].set(Me.[@@REACTIVE](var))', '	End Property', '	Public Property Get [' + key + ']', '		On Error Resume Next', '		Set [' + key + '] = Me.[@@TARGET].[' + key + '].get()', '		If Err.Number <> 0 Then', '			[' + key + '] = Me.[@@TARGET].[' + key + '].get()', '		End If', '		On Error Goto 0', '	End Property');
	      keys.push(key);
	    } else {
	      scripts.push('	Public [' + key + ']');
	    }
	  }
	  scripts = scripts.concat(['End Class', 'Function VBReactiveClassFactory' + id + '()', '	Set VBReactiveClassFactory' + id + ' = New VBReactiveClass' + id, 'End Function']);
	  window.execScript(scripts.join('\n'), 'VBScript');
	  return createJsClass(id, keys, Super, reactive, getSignals);
	}
	function createJsClass(id, keys, Super, reactive, getSignals) {
	  var Class = function () {
	    var o = window['VBReactiveClassFactory' + id]();
	    var target;
	    if (getSignals) {
	      target = getSignals.call(o, keys);
	    } else {
	      target = {};
	      var i = keys.length;
	      while (i--) {
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
	  if (Super && Super !== Object) {
	    Object.setPrototypeOf(Class, Super);
	    Class.prototype = Object.create(Super.prototype);
	  }
	  Class.prototype.constructor = Class;
	  return Class;
	}
	function returnArg(arg1) {
	  return arg1;
	}
	var cache = {};
	function record(o, reactive) {
	  var keys = Object.keys(o).sort();
	  var key = keys.join("\n");
	  var Class = cache[key];
	  if (!Class) {
	    Class = createClass(o, reactive);
	    cache[key] = Class;
	  }
	  var r = new Class();
	  var i = keys.length;
	  while (i--) {
	    key = keys[i];
	    r[key] = o[key];
	  }
	  return r;
	}
	var isReactive = new WeakMap();
	function reactive(o) {
	  if (o == null) {
	    return o;
	  }
	  if (Array.isArray(o)) {
	    if (isReactive.get(o)) {
	      return o;
	    }
	    o = array(o, reactive);
	    isReactive.set(o, true);
	  } else if (o.constructor === Object) {
	    if (isReactive.get(o)) {
	      return o;
	    }
	    return record(o, reactive);
	  }
	  return o;
	}

	QUnit.test('record#key', function (assert) {
	  var object = reactive({
	    name: "Tom"
	  });
	  var key = {};
	  var i = 0;
	  effect(key, function () {
	    return object.name;
	  }, function () {
	    i++;
	  });
	  assert.equal(i, 0);
	  object.name = "Jerry";
	  assert.equal(i, 1);
	});

	var LENGTH = 'length';
	QUnit.test('array#length', function (assert) {
	  var array = reactive([]);
	  assert.equal(array.length, 0);
	});
	QUnit.test('array#at', function (assert) {
	  var array = reactive([]);
	  var key = {};
	  var i = 0;
	  effect(key, function () {
	    return array.at(0);
	  }, function () {
	    i++;
	  });
	  assert.equal(i, 0);
	  array.push(0);
	  assert.equal(i, 1);
	  assert.equal(array.at(0), 0);
	});
	QUnit.test('array#push', function (assert) {
	  var array = reactive([]);
	  var counts = new Map();
	  new Array(8).fill(1).forEach(function (_, i) {
	    var key = i - 2;
	    counts.set(key, 0);
	    effect({}, function () {
	      return array.at(key);
	    }, function () {
	      var count = counts.get(key);
	      count++;
	      counts.set(key, count);
	    });
	  });
	  counts.set(LENGTH, 0);
	  effect({}, function () {
	    return array.length;
	  }, function () {
	    var count = counts.get(LENGTH);
	    count++;
	    counts.set(LENGTH, count);
	  });
	  assert.equal(array.length, 0);
	  // []
	  // -2 -1  0  1  2  3  4  5
	  //  x  x  x  x  x  x  x  x
	  array.push(0);
	  assert.equal(array.length, 1);
	  assert.equal(counts.get(LENGTH), 1);
	  assert.equal(counts.get(-2), 0);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 0);
	  assert.equal(counts.get(2), 0);
	  assert.equal(counts.get(3), 0);
	  assert.equal(counts.get(4), 0);
	  assert.equal(counts.get(5), 0);
	  // [0]
	  // -2 -1  0  1  2  3  4  5
	  //  x  0  0  x  x  x  x  x
	  array.push(0);
	  assert.equal(counts.get(LENGTH), 2);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 0);
	  assert.equal(counts.get(3), 0);
	  assert.equal(counts.get(4), 0);
	  assert.equal(counts.get(5), 0);
	  // [0, 0]
	  // -2 -1  0  1  2  3  4  5
	  //  0  0  0  0  x  x  x  x
	  array.push(0);
	  assert.equal(counts.get(LENGTH), 3);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	  assert.equal(counts.get(3), 0);
	  assert.equal(counts.get(4), 0);
	  assert.equal(counts.get(5), 0);
	  // [0, 0, 0]
	  // -2 -1  0  1  2  3  4  5
	  //  0  0  0  0  0  x  x  x
	  array.push(0, 0);
	  assert.equal(counts.get(LENGTH), 4);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	  assert.equal(counts.get(3), 1);
	  assert.equal(counts.get(4), 1);
	  assert.equal(counts.get(5), 0);
	  // [0, 0, 0, 0]
	  // -2 -1  0  1  2  3  4  5
	  //  0  0  0  0  0  0  x  x
	});

	QUnit.test('array#pop', function (assert) {
	  var array = reactive([1, 2, 3, 4, 5]);
	  assert.equal(array.length, 5);
	  var counts = new Map();
	  new Array(5).fill(1).forEach(function (_, i) {
	    var key = i - 2;
	    counts.set(key, 0);
	    effect({}, function () {
	      return array.at(key);
	    }, function () {
	      var count = counts.get(key);
	      count++;
	      counts.set(key, count);
	    });
	  });
	  counts.set(LENGTH, 0);
	  effect({}, function () {
	    return array.length;
	  }, function () {
	    var count = counts.get(LENGTH);
	    count++;
	    counts.set(LENGTH, count);
	  });
	  // [1, 2, 3, 4, 5]
	  // -2 -1  0  1  2  3  4  5
	  //  4  5  1  2  3  4  5  x
	  array.pop();
	  assert.equal(array.length, 4);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(LENGTH), 1);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 0);
	  assert.equal(counts.get(1), 0);
	  assert.equal(counts.get(2), 0);
	  // [1, 2, 3, 4]
	  // -2 -1  0  1  2  3  4  5
	  //  3  4  1  2  3  4  x  x
	  array.pop();
	  assert.equal(array.length, 3);
	  assert.equal(counts.get(LENGTH), 2);
	  assert.equal(counts.get(-2), 2);
	  assert.equal(counts.get(-1), 2);
	  assert.equal(counts.get(0), 0);
	  assert.equal(counts.get(1), 0);
	  assert.equal(counts.get(2), 0);
	  // [1, 2, 3]
	  // -2 -1  0  1  2  3  4  5
	  //  2  3  1  2  3  x  x  x
	  array.pop();
	  assert.equal(array.at(2), void 0);
	  assert.equal(array.length, 2);
	  assert.equal(counts.get(LENGTH), 3);
	  assert.equal(counts.get(-2), 3);
	  assert.equal(counts.get(-1), 3);
	  assert.equal(counts.get(0), 0);
	  assert.equal(counts.get(1), 0);
	  assert.equal(counts.get(2), 1);
	  // [1, 2]
	  // -2 -1  0  1  2  3  4  5
	  //  1  2  1  2  x  x  x  x
	  array.pop();
	  assert.equal(array.length, 1);
	  assert.equal(counts.get(LENGTH), 4);
	  assert.equal(counts.get(-2), 4);
	  assert.equal(counts.get(-1), 4);
	  assert.equal(counts.get(0), 0);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	  // [1]
	  // -2 -1  0  1  2  3  4  5
	  //  x  1  1  x  x  x  x  x
	  array.pop();
	  assert.equal(array.length, 0);
	  assert.equal(counts.get(LENGTH), 5);
	  assert.equal(counts.get(-2), 4);
	  assert.equal(counts.get(-1), 5);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	  // []
	  // -2 -1  0  1  2  3  4  5
	  //  x  x  x  x  x  x  x  x
	});

	QUnit.test('array#unshift', function (assert) {
	  var array = reactive([]);
	  assert.equal(array.length, 0);
	  var counts = new Map();
	  new Array(5).fill(1).forEach(function (_, i) {
	    var key = i - 2;
	    counts.set(key, 0);
	    effect({}, function () {
	      return array.at(key);
	    }, function () {
	      var count = counts.get(key);
	      count++;
	      counts.set(key, count);
	    });
	  });
	  counts.set(LENGTH, 0);
	  effect({}, function () {
	    return array.length;
	  }, function () {
	    var count = counts.get(LENGTH);
	    count++;
	    counts.set(LENGTH, count);
	  });
	  // -2 -1  0  1  2
	  //  x  x  x  x  x
	  array.unshift(1);
	  assert.equal(array.length, 1);
	  assert.equal(counts.get(LENGTH), 1);
	  assert.equal(counts.get(-2), 0);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 0);
	  assert.equal(counts.get(2), 0);
	  // -2 -1  0  1  2
	  //  x  1  1  x  x
	  array.unshift(2);
	  assert.equal(array.length, 2);
	  assert.equal(counts.get(LENGTH), 2);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 2);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 0);
	  // -2 -1  0  1  2
	  //  2  1  2  1  x
	  array.unshift(3);
	  assert.equal(array.length, 3);
	  assert.equal(counts.get(LENGTH), 3);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 3);
	  assert.equal(counts.get(1), 2);
	  assert.equal(counts.get(2), 1);
	  // -2 -1  0  1  2
	  //  2  1  3  2  1
	});

	QUnit.test('array#shift', function (assert) {
	  var array = reactive([1, 2, 3, 4, 5]);
	  assert.equal(array.length, 5);
	  var counts = new Map();
	  new Array(5).fill(1).forEach(function (_, i) {
	    var key = i - 2;
	    counts.set(key, 0);
	    effect({}, function () {
	      return array.at(key);
	    }, function () {
	      var count = counts.get(key);
	      count++;
	      counts.set(key, count);
	    });
	  });
	  counts.set(LENGTH, 0);
	  effect({}, function () {
	    return array.length;
	  }, function () {
	    var count = counts.get(LENGTH);
	    count++;
	    counts.set(LENGTH, count);
	  });
	  // [1, 2, 3, 4, 5]
	  array.shift();
	  assert.equal(array.length, 4);
	  assert.equal(counts.get(LENGTH), 1);
	  assert.equal(counts.get(-2), 0);
	  assert.equal(counts.get(-1), 0);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	  // [2, 3, 4, 5]
	  array.shift();
	  assert.equal(array.length, 3);
	  assert.equal(counts.get(LENGTH), 2);
	  assert.equal(counts.get(-2), 0);
	  assert.equal(counts.get(-1), 0);
	  assert.equal(counts.get(0), 2);
	  assert.equal(counts.get(1), 2);
	  assert.equal(counts.get(2), 2);
	  // [3, 4, 5]
	  array.shift();
	  assert.equal(array.length, 2);
	  assert.equal(counts.get(LENGTH), 3);
	  assert.equal(counts.get(-2), 0);
	  assert.equal(counts.get(-1), 0);
	  assert.equal(counts.get(0), 3);
	  assert.equal(counts.get(1), 3);
	  assert.equal(counts.get(2), 3);
	  // [4, 5]
	  array.shift();
	  assert.equal(array.length, 1);
	  assert.equal(counts.get(LENGTH), 4);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 0);
	  assert.equal(counts.get(0), 4);
	  assert.equal(counts.get(1), 4);
	  assert.equal(counts.get(2), 3);
	  // [5]
	  array.shift();
	  assert.equal(array.length, 0);
	  assert.equal(counts.get(LENGTH), 5);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 5);
	  assert.equal(counts.get(1), 4);
	  assert.equal(counts.get(2), 3);
	  // []
	});

	QUnit.test('array#splice', function (assert) {
	  var array = reactive([1, 2, 3, 4, 5]);
	  assert.equal(array.length, 5);
	  var counts = new Map();
	  new Array(5).fill(1).forEach(function (_, i) {
	    var key = i - 2;
	    counts.set(key, 0);
	    effect({}, function () {
	      return array.at(key);
	    }, function () {
	      var count = counts.get(key);
	      count++;
	      counts.set(key, count);
	    });
	  });
	  counts.set(LENGTH, 0);
	  effect({}, function () {
	    return array.length;
	  }, function () {
	    var count = counts.get(LENGTH);
	    count++;
	    counts.set(LENGTH, count);
	  });
	  // [1, 2, 3, 4, 5]
	  // -2 -1  0  1  2  3  4  5
	  //  4  5  1  2  3  4  5  x
	  array.splice(1, 1);
	  assert.equal(array.length, 4);
	  assert.equal(counts.get(LENGTH), 1);
	  assert.equal(counts.get(-2), 0);
	  assert.equal(counts.get(-1), 0);
	  assert.equal(counts.get(0), 0);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	  // [1, 3, 4, 5]
	  // -2 -1  0  1  2  3  4  5
	  //  4  5  1  3  4  5  x  x
	  array.splice(1, 0, 3);
	  assert.equal(array.length, 5);
	  assert.equal(counts.get(LENGTH), 2);
	  assert.equal(counts.get(-2), 0);
	  assert.equal(counts.get(-1), 0);
	  assert.equal(counts.get(0), 0);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 2);
	  // [1, 3, 3, 4, 5]
	  // -2 -1  0  1  2  3  4  5
	  //  4  5  1  3  3  4  5  x
	});

	QUnit.test('class#key', function (assert) {
	  var Class = createClass({
	    a: 1,
	    b: undefined
	  });
	  var object = new Class();
	  var i = 0;
	  effect({}, function () {
	    return object.a;
	  }, function () {
	    i++;
	  });
	  assert.equal(i, 0);
	  object.a = 2;
	  assert.equal(i, 1);
	  var j = 0;
	  effect({}, function () {
	    return object.b;
	  }, function () {
	    j++;
	  });
	  assert.equal(j, 0);
	  object.b = 2;
	  assert.equal(j, 1);
	});

})();
