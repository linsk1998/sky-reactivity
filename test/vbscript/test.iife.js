(function () {
	'use strict';

	if (!window.console) {
	  window.console = function () {
	    function log(data) {
	      if (window.Debug) {
	        Debug.writeln(data);
	      }
	    }
	    function clear() {}
	    return {
	      log: log,
	      info: log,
	      error: log,
	      warn: log,
	      clear: clear
	    };
	  }();
	}

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

	function F() {/* empty */}
	function create$1(proto, properties) {
	  var o;
	  if (proto !== null) {
	    F.prototype = proto;
	    var o = new F();
	    F.prototype = null;
	  } else {
	    o = NullProtoObject();
	  }
	  o.__proto__ = proto;
	  if (properties) {
	    Object.defineProperties(o, properties);
	  }
	  return o;
	}
	create$1.sham = true;

	function create(proto, properties) {
	  var o = {};
	  Object.setPrototypeOf(o, proto);
	  if (properties) {
	    Object.defineProperties(o, properties);
	  }
	  return o;
	}

	if (!Object$1.create) {
	  if ('__proto__' in Object$1.prototype) {
	    Object$1.create = create;
	  } else {
	    Object$1.create = create$1;
	  }
	}

	var proto = !!Object$1.setPrototypeOf || '__proto__' in Object$1.prototype;

	function setPrototypeOf(obj, proto) {
	  console.warn("ES3 do NOT support setPrototypeOf.");
	  var o = create$1(proto);
	  var key;
	  for (key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      o[key] = obj[key];
	    }
	  }
	  var i = dontEnums.length;
	  while (i-- > 0) {
	    key = dontEnums[i];
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      o[key] = obj[key];
	    }
	  }
	  return o;
	}

	if (!proto) {
	  Object$1.setPrototypeOf = setPrototypeOf;
	}

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

	function map(fn) {
	  var thisArg = arguments[1];
	  var arr = [];
	  for (var k = 0, length = this.length; k < length; k++) {
	    arr.push(fn.call(thisArg, this[k], k, this));
	  }
	  return arr;
	}

	if (!Array.prototype.map) {
	  Array.prototype.map = map;
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

	var slice$1 = Array.prototype.slice;

	if (!Function.prototype.bind) {
	  Function.prototype.bind = function (context) {
	    var self = this,
	      args = slice$1.call(arguments, 1);
	    return function () {
	      return self.apply(context, args.concat(slice$1.call(arguments)));
	    };
	  };
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function () {
	    function _setPrototypeOf(o, p) {
	      o.__proto__ = p;
	      return o;
	    }
	    return _setPrototypeOf;
	  }();
	  return _setPrototypeOf(o, p);
	}

	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  _setPrototypeOf(subClass, superClass);
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
	  deep--;
	  if (deep === 0) {
	    try {
	      actionsToDo.forEach(_notify);
	    } catch (e) {
	      console.error(e);
	    } finally {
	      actionsToDo.clear();
	    }
	  }
	}
	function collectCallback(callback, key) {
	  actionsToDo.set(key, callback);
	}
	var relation = new WeakMap();
	function stop(key) {
	  var rel = relation.get(key);
	  if (rel) {
	    rel.forEach(forEachObs);
	    rel.clear();
	    relation["delete"](key);
	  }
	}
	function forEachObs(key, ob) {
	  ob.unobserve(key);
	}
	var keyStack = [];
	var callbackStack = [];
	var computedStack = [];
	var currentKey;
	var currentCallback;
	var currentComputed;
	function track(key, callback) {
	  currentKey = key;
	  keyStack.push(key);
	  currentCallback = callback;
	  callbackStack.push(callback);
	}
	function untrack() {
	  keyStack.pop();
	  currentKey = keyStack[keyStack.length - 1];
	  callbackStack.pop();
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
	function effectComputed(key, collect, callback) {
	  try {
	    track(key, callback);
	    currentComputed = key;
	    computedStack.push(key);
	    return collect.call(key);
	  } finally {
	    untrack();
	    computedStack.pop();
	    currentComputed = computedStack[computedStack.length - 1];
	  }
	}
	var Signal$1 = /*#__PURE__*/function () {
	  function Signal(initValue) {
	    this._callbacks = new Map();
	    this._computeds = new Set();
	    this.value = initValue;
	  }
	  var _proto = Signal.prototype;
	  _proto.get = function () {
	    function get() {
	      if (currentComputed) {
	        this._computeds.add(currentKey);
	      }
	      if (currentKey) {
	        if (!this._callbacks.has(currentKey)) {
	          this._callbacks.set(currentKey, currentCallback);
	          var rel = relation.get(currentKey);
	          if (!rel) {
	            rel = new Map();
	            relation.set(currentKey, rel);
	          }
	          rel.set(this, currentKey);
	        }
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
	      this._computeds.forEach(reset);
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
	      this._computeds["delete"](key);
	      this._callbacks["delete"](key);
	    }
	    return unobserve;
	  }();
	  return Signal;
	}();
	function reset(computed) {
	  computed.reset();
	}
	function signal(initValue) {
	  return new Signal$1(initValue);
	}
	var Computed = /*#__PURE__*/function (_Signal$) {
	  _inheritsLoose(Computed, _Signal$);
	  function Computed(getter, setter) {
	    var _this;
	    _this = _Signal$.call(this) || this;
	    _this.hasCache = false;
	    _this.getter = getter;
	    _this.setter = setter;
	    return _this;
	  }
	  var _proto2 = Computed.prototype;
	  _proto2.get = function () {
	    function get() {
	      if (this.hasCache) {
	        return _Signal$.prototype.get.call(this);
	      }
	      stop(this);
	      this.value = effectComputed(this, this.getter, this.onChange);
	      this.hasCache = true;
	      return _Signal$.prototype.get.call(this);
	    }
	    return get;
	  }();
	  _proto2.reset = function () {
	    function reset() {
	      this.hasCache = false;
	    }
	    return reset;
	  }();
	  _proto2.onChange = function () {
	    function onChange() {
	      this.notify();
	    }
	    return onChange;
	  }();
	  _proto2.set = function () {
	    function set(value) {
	      if (this.setter) {
	        this.setter(value);
	      } else {
	        throw new TypeError("This computed is Readonly.");
	      }
	    }
	    return set;
	  }();
	  return Computed;
	}(Signal$1);
	function computed(getter, setter) {
	  return new Computed(getter, setter);
	}
	var SIGNAL = '@@SIGNAL';
	var REACTIVE$1 = '@@REACTIVE';
	var slice = Array.prototype.slice;
	var prototype = Object.create(Array.prototype);
	['at', 'map', 'filter', 'concat'].forEach(function (key) {
	  var fn = Array.prototype[key];
	  prototype[key] = function () {
	    this[SIGNAL].get();
	    return fn.apply(this, arguments);
	  };
	});
	['push', 'unshift'].forEach(function (key) {
	  var fn = Array.prototype[key];
	  prototype[key] = function () {
	    var reactive = this[REACTIVE$1];
	    var items = slice.call(arguments);
	    items = items.map(reactive);
	    var s = this[SIGNAL];
	    s.set(!s.get());
	    return fn.apply(this, items);
	  };
	});
	['pop', 'shift'].forEach(function (key) {
	  var fn = Array.prototype[key];
	  prototype[key] = function () {
	    var s = this[SIGNAL];
	    s.set(!s.get());
	    return fn.apply(this, arguments);
	  };
	});
	var splice = Array.prototype.splice;
	prototype.splice = function () {
	  var items = slice.call(arguments);
	  if (items.length > 2) {
	    var reactive = this[REACTIVE$1];
	    var index = items[0];
	    var length = items[1];
	    items = items.map(reactive);
	    items.shift(index, length);
	  }
	  var s = this[SIGNAL];
	  s.set(!s.get());
	  return splice.apply(this, arguments);
	};
	var allprops = ['at', 'map', 'filter', 'concat', 'push', 'unshift', 'pop', 'shift', 'splice'];
	function array(arr, reactive) {
	  var i = arr.length;
	  var r = new Array(i);
	  r[SIGNAL] = new Signal(false);
	  r[REACTIVE$1] = reactive;
	  while (i-- > 0) {
	    r[i] = reactive(arr[i], i);
	  }
	  allprops.forEach(setMethod, r);
	  return r;
	}
	function setMethod(key) {
	  this[key] = prototype[key];
	}
	var seq = 0;
	var TARGET = '@@TARGET';
	var REACTIVE = '@@REACTIVE';
	function createClass(options) {
	  var id = ++seq;
	  var scripts = ['Class VBReactiveClass' + id, '	Public [@@TARGET]', '	Public [@@WeakMap]', '	Public [@@REACTIVE]', '	Public [__proto__]', '	Public [constructor]'];
	  var key;
	  var members = options.members;
	  if (members) {
	    for (key in members) {
	      scripts.push('	Public [' + key + ']');
	    }
	  }
	  var observables = options.observables;
	  if (observables) {
	    for (key in observables) {
	      scripts.push('	Public Property Let [' + key + '](var)', '		Call Me.[@@TARGET].[' + key + '].set(var)', '	End Property', '	Public Property Set [' + key + '](var)', '		Call Me.[@@TARGET].[' + key + '].set(Me.[@@REACTIVE](var,"' + key + '"))', '	End Property', '	Public Property Get [' + key + ']', '		On Error Resume Next', '		Set [' + key + '] = Me.[@@TARGET].[' + key + '].get()', '		If Err.Number <> 0 Then', '			[' + key + '] = Me.[@@TARGET].[' + key + '].get()', '		End If', '		On Error Goto 0', '	End Property');
	    }
	  }
	  var accessors = options.accessors;
	  if (accessors) {
	    for (key in accessors) {
	      var desc = accessors[key];
	      scripts.push('	Public [@@desc:' + key + ']');
	      if (desc.set) {
	        scripts.push('	Public Property Let [' + key + '](var)', '		Call Me.[@@desc:' + key + '].set.call(Me, var)', '	End Property', '	Public Property Set [' + key + '](var)', '		Call Me.[@@desc:' + key + '].set.call(Me, var)', '	End Property');
	      }
	      if (desc.get) {
	        scripts.push('	Public Property Get [' + key + ']', '		On Error Resume Next', '		Set [' + key + '] = Me.[@@desc:' + key + '].get.call(Me)', '		If Err.Number <> 0 Then', '			[' + key + '] = Me.[@@desc:' + key + '].get.call(Me)', '		End If', '		On Error Goto 0', '	End Property');
	      }
	    }
	  }
	  var computed = options.computed;
	  if (computed) {
	    for (key in computed) {
	      var desc = computed[key];
	      if (desc.set) {
	        scripts.push('	Public Property Let [' + key + '](var)', '		Call Me.[@@TARGET].[' + key + '].set(var)', '	End Property', '	Public Property Set [' + key + '](var)', '		Call Me.[@@TARGET].[' + key + '].set(Me.[@@REACTIVE](var,"' + key + '"))', '	End Property');
	      }
	      if (desc.get) {
	        scripts.push('	Public Property Get [' + key + ']', '		On Error Resume Next', '		Set [' + key + '] = Me.[@@TARGET].[' + key + '].get()', '		If Err.Number <> 0 Then', '			[' + key + '] = Me.[@@TARGET].[' + key + '].get()', '		End If', '		On Error Goto 0', '	End Property');
	      }
	    }
	  }
	  var methods = options.methods;
	  if (methods) {
	    for (key in methods) {
	      scripts.push('	Public [' + key + ']');
	    }
	  }
	  var batches = options.batches;
	  if (batches) {
	    for (key in batches) {
	      scripts.push('	Public [' + key + ']');
	    }
	  }
	  scripts = scripts.concat(['End Class', 'Function VBReactiveClassFactory' + id + '()', '	Set VBReactiveClassFactory' + id + ' = New VBReactiveClass' + id, 'End Function']);
	  window.execScript(scripts.join('\n'), 'VBScript');
	  return createJsClass(id, options);
	}
	function createJsClass(id, options) {
	  var Super = options['super'];
	  var reactive = options.reactive || returnArg;
	  var Class = function () {
	    var o = window['VBReactiveClassFactory' + id]();
	    var key;
	    var accessors = options.accessors;
	    if (accessors) {
	      for (key in accessors) {
	        o["@@desc:" + key] = accessors[key];
	      }
	    }
	    var target = o[TARGET] = {};
	    o[REACTIVE] = reactive;
	    var observables = options.observables;
	    if (observables) {
	      for (key in observables) {
	        target[key] = signal(observables[key]);
	      }
	    }
	    var com = options.computed;
	    if (com) {
	      for (key in com) {
	        var desc = com[key];
	        var getter = desc.get;
	        var setter = desc.set;
	        target[key] = computed(getter.bind(o), setter && setter.bind(o));
	      }
	    }
	    var methods = options.methods;
	    if (methods) {
	      for (key in methods) {
	        o[key] = methods[key].bind(o);
	      }
	    }
	    var batches = options.batches;
	    if (batches) {
	      var keys = Object.keys(batches);
	      keys.forEach(function (key) {
	        var fn = batches[key];
	        this[key] = function () {
	          try {
	            batchStart();
	            fn.apply(o, arguments);
	          } catch (e) {
	            console.error(e);
	          } finally {
	            batchEnd();
	          }
	        };
	      }, o);
	    }
	    o.constructor = Class;
	    o.__proto__ = Class.prototype;
	    if (Super && Super !== Object) {
	      Super.apply(o, arguments);
	    }
	    return o;
	  };
	  if (Super && Super !== Object) {
	    Class.prototype = Object.create(Super.prototype);
	    Object.setPrototypeOf(Class, Super);
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
	    Class = createClass({
	      observables: o
	    });
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
	    return record(o);
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
	  assert.ok(array instanceof Array);
	  // assert.ok(Array.isArray(array));
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
	  assert.equal(counts.get(LENGTH), 0);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	  assert.equal(counts.get(3), 1);
	  assert.equal(counts.get(4), 1);
	  assert.equal(counts.get(5), 1);
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
	  assert.equal(counts.get(LENGTH), 0);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
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
	  assert.equal(counts.get(LENGTH), 0);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
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
	  assert.equal(counts.get(LENGTH), 0);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
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
	  assert.equal(counts.get(LENGTH), 0);
	  assert.equal(counts.get(-2), 1);
	  assert.equal(counts.get(-1), 1);
	  assert.equal(counts.get(0), 1);
	  assert.equal(counts.get(1), 1);
	  assert.equal(counts.get(2), 1);
	});

	var Class = createClass({
	  members: {
	    a: undefined
	  },
	  observables: {
	    b: undefined
	  },
	  accessors: {
	    c: {
	      get: function () {
	        return this.a * 2;
	      }
	    },
	    d: {
	      get: function () {
	        return this.a * 2;
	      },
	      set: function (v) {
	        this.a = v / 2;
	      }
	    }
	  },
	  computed: {
	    e: {
	      get: function () {
	        return this.b * 2;
	      }
	    },
	    f: {
	      get: function () {
	        return this.b * 2;
	      },
	      set: function (v) {
	        this.b = v / 2;
	      }
	    }
	  },
	  methods: {
	    g: function () {
	      this.a++;
	    }
	  },
	  batches: {
	    h: function () {
	      this.b++;
	      this.b++;
	    }
	  }
	});
	QUnit.test('class#dirct-member', function (assert) {
	  var object = new Class();
	  object.a = 1;
	  object.b = 1;
	  var i = 0;
	  var a = effect({}, function () {
	    return object.a;
	  }, function () {
	    i++;
	  });
	  assert.equal(a, 1);
	  assert.equal(i, 0);
	  object.a = 2;
	  assert.equal(i, 0);
	});
	QUnit.test('class#observable-key', function (assert) {
	  var object = new Class();
	  object.a = 1;
	  object.b = 1;
	  var i = 0;
	  var b = effect({}, function () {
	    return object.b;
	  }, function () {
	    i++;
	  });
	  assert.equal(b, 1);
	  assert.equal(i, 0);
	  object.b = 2;
	  assert.equal(i, 1);
	});
	QUnit.test('class#dirct-accessor', function (assert) {
	  var object = new Class();
	  object.a = 1;
	  object.b = 1;
	  var i = 0;
	  var c = effect({}, function () {
	    return object.c;
	  }, function () {
	    i++;
	  });
	  assert.equal(object.a, 1);
	  assert.equal(c, 2);
	  assert.equal(i, 0);
	  assert["throws"](function () {
	    object.c = 4;
	  });
	  assert.equal(i, 0);
	  var j = 0;
	  var d = effect({}, function () {
	    return object.d;
	  }, function () {
	    j++;
	  });
	  assert.equal(d, 2);
	  assert.equal(j, 0);
	  object.d = 4;
	  assert.equal(j, 0);
	  assert.equal(object.d, 4);
	  assert.equal(object.a, 2);
	});
	QUnit.test('class#computed-key', function (assert) {
	  var object = new Class();
	  object.a = 1;
	  object.b = 1;
	  var i = 0;
	  var e = effect({}, function () {
	    return object.e;
	  }, function () {
	    i++;
	  });
	  assert.equal(object.b, 1);
	  assert.equal(e, 2);
	  assert.equal(i, 0);
	  assert["throws"](function () {
	    object.e = 4;
	  });
	  assert.equal(i, 0);
	  var j = 0;
	  var f = effect({}, function () {
	    return object.f;
	  }, function () {
	    j++;
	  });
	  assert.equal(f, 2);
	  assert.equal(j, 0);
	  object.f = 4;
	  assert.equal(j, 1);
	  assert.equal(object.f, 4);
	  assert.equal(object.b, 2);
	});
	QUnit.test('class#method-bind', function (assert) {
	  var object = new Class();
	  object.a = 1;
	  object.b = 1;
	  var i = 0;
	  var a = effect({}, function () {
	    return object.a;
	  }, function () {
	    i++;
	  });
	  assert.equal(a, 1);
	  assert.equal(i, 0);
	  var g = object.g;
	  g();
	  assert.equal(object.a, 2);
	  assert.equal(i, 0);
	});
	QUnit.test('class#batches-key', function (assert) {
	  var object = new Class();
	  object.a = 1;
	  object.b = 1;
	  var i = 0;
	  var b = effect({}, function () {
	    return object.b;
	  }, function () {
	    i++;
	  });
	  assert.equal(b, 1);
	  assert.equal(i, 0);
	  var h = object.h;
	  h();
	  assert.equal(object.b, 3);
	  assert.equal(i, 1);
	});

})();
