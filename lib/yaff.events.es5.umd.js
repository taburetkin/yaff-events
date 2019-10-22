(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('core-js/modules/es.symbol'), require('core-js/modules/es.symbol.description'), require('core-js/modules/es.symbol.iterator'), require('core-js/modules/es.array.iterator'), require('core-js/modules/es.function.bind'), require('core-js/modules/es.map'), require('core-js/modules/es.object.to-string'), require('core-js/modules/es.string.iterator'), require('core-js/modules/es.weak-map'), require('core-js/modules/web.dom-collections.iterator'), require('core-js/modules/es.array.is-array'), require('core-js/modules/es.array.map'), require('core-js/modules/es.array.reduce'), require('core-js/modules/es.object.entries'), require('core-js/modules/es.regexp.exec'), require('core-js/modules/es.string.replace'), require('core-js/modules/es.string.split'), require('core-js/modules/es.array.concat'), require('core-js/modules/es.array.from'), require('core-js/modules/es.set')) :
  typeof define === 'function' && define.amd ? define(['exports', 'core-js/modules/es.symbol', 'core-js/modules/es.symbol.description', 'core-js/modules/es.symbol.iterator', 'core-js/modules/es.array.iterator', 'core-js/modules/es.function.bind', 'core-js/modules/es.map', 'core-js/modules/es.object.to-string', 'core-js/modules/es.string.iterator', 'core-js/modules/es.weak-map', 'core-js/modules/web.dom-collections.iterator', 'core-js/modules/es.array.is-array', 'core-js/modules/es.array.map', 'core-js/modules/es.array.reduce', 'core-js/modules/es.object.entries', 'core-js/modules/es.regexp.exec', 'core-js/modules/es.string.replace', 'core-js/modules/es.string.split', 'core-js/modules/es.array.concat', 'core-js/modules/es.array.from', 'core-js/modules/es.set'], factory) :
  (global = global || self, factory(global.yaffEvents = {}));
}(this, function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var ids = {
    "default": 0
  };
  /**
   * Provides new unique id on each call
   * @private
   * @export
   * @param {*} pref
   * @returns
   */

  function newid(pref) {
    !pref && (pref = '');

    if (!ids[pref]) {
      ids[pref] = 0;
    }

    return pref + ++ids[pref];
  }
  function isString(arg) {
    return typeof arg == 'string' || arg instanceof String;
  }
  function isFunc(arg) {
    return typeof arg == 'function';
  }
  function isArr(arg) {
    return Array.isArray(arg);
  }
  function isObj(arg) {
    return !isFunc(arg) && arg instanceof Object;
  }
  /**
   * unwraps string events to array of eventContext and spread with provided default context
   * `event1 event2` => `[{ eventName: 'event1' }, { eventName: 'event1' }]`
   * @param {*} eventNames
   * @param {*} context
   * @returns
   */

  function unString(eventNames, context) {
    var _this2 = this;

    return eventNames.split(/\s+/g).map(function (eventName) {
      _newArrowCheck(this, _this2);

      return _objectSpread2({
        eventName: eventName
      }, context);
    }.bind(this));
  }
  /**
   * unwraps key value to a correct array
   * { event: {} } => { event: [defaultCallback, {} ] }
   * { event: () => {} } => { event: [() => {}, defaultContext ] }
   * @private
   * @param {*} arg
   * @param {(function|void)} defCb
   * @param {(object|void)} defCnt
   * @returns
   */


  function normalizeHashArray(arg, defCb, defCnt) {
    if (!isArr(arg)) {
      if (isFunc(arg)) {
        arg = [arg, void 0];
      } else if (isObj(arg)) {
        arg = [void 0, arg];
      } else if (arg === void 0) {
        arg = [void 0, void 0];
      } else {
        arg = [null, null];
      }
    }

    if (!arg.length) {
      arg = [void 0, void 0];
    }

    var _arg = arg,
        _arg2 = _slicedToArray(_arg, 2),
        _arg2$ = _arg2[0],
        first = _arg2$ === void 0 ? defCb : _arg2$,
        _arg2$2 = _arg2[1],
        second = _arg2$2 === void 0 ? defCnt : _arg2$2;

    if (isObj(first) && arg.length == 1) {
      second = first;
      first = defCb;
    }

    if (first !== null) {
      first = isFunc(first) && first || void 0;
    } else {
      first = void 0;
    }

    if (second !== null) {
      second = isObj(second) && second || void 0;
    } else {
      second = void 0;
    }

    return [first, second];
  }
  /**
   * unwraps given hash { event: something } to the array of eventContexts
   * @private
   * @param {object} hash
   * @param {object} defItem
   * @param {function} defCallback
   * @param {object} defContext
   * @returns
   */


  function argumentsHashReducer(hash, defItem, defCallback, defContext) {
    var _this3 = this;

    return Object.entries(hash).reduce(function (contexts, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          eventNames = _ref2[0],
          arg = _ref2[1];

      _newArrowCheck(this, _this3);

      arg = normalizeHashArray(arg, defCallback, defContext);

      var _arg3 = arg,
          _arg4 = _slicedToArray(_arg3, 2),
          takeCallback = _arg4[0],
          takeContext = _arg4[1];

      var item = _objectSpread2({
        callback: takeCallback,
        context: takeContext
      }, defItem);

      var arr = unString(eventNames, item);
      contexts.push.apply(contexts, _toConsumableArray(arr));
      return contexts;
    }.bind(this), []);
  }

  var prepareTypes = {
    add: {
      extractArgs: function extractArgs(args, options) {
        var takeEmiter = options.takeEmiter,
            listener = options.listener,
            once = options.once,
            defaultContext = options.defaultContext;
        var emiter = takeEmiter && args.shift() || options.emiter;
        var eventNames;
        var callback;
        var context;

        var _args = _slicedToArray(args, 3),
            first = _args[0],
            second = _args[1],
            third = _args[2];

        callback = isFunc(second) && second || undefined;
        context = isObj(third) && third || isObj(second) && second || undefined;

        if (isString(first)) {
          eventNames = first;
          return unString(eventNames, {
            callback: callback || second,
            // backbone test: if callback is truthy but not a function, `on` should throw an error just like jQuery
            context: context,
            emiter: emiter,
            listener: listener,
            once: once,
            defaultContext: defaultContext
          });
        } else if (isObj(first)) {
          var defitem = {
            emiter: emiter,
            listener: listener,
            once: once,
            defaultContext: defaultContext
          };
          return argumentsHashReducer(first, defitem, callback, context);
        }
      }
    },
    remove: {
      takeEmiter: function takeEmiter(args, options) {
        if (options.takeEmiter) {
          if (isObj(args[0]) || args[0] === null) {
            var emiter = args.shift();
            return emiter !== null && emiter || void 0;
          }
        }

        return options.emiter;
      },
      extractArgs: function extractArgs(args, options) {
        var emiter = this.takeEmiter(args, options);
        var listener = options.listener;
        var hash;
        var eventNames;
        var callback;
        var context;

        var _args2 = _slicedToArray(args, 3),
            first = _args2[0],
            second = _args2[1],
            third = _args2[2];

        if (isString(first)) {
          eventNames = first;
        } else if (isFunc(first)) {
          callback = first;
        } else if (isObj(first)) {
          hash = first;
        }

        if (isFunc(second)) {
          callback = second;
        } else if (isObj(second)) {
          context = second;
        }

        if (isObj(third)) {
          context = third;
        }

        if (eventNames) {
          return unString(eventNames, {
            callback: callback,
            context: context,
            emiter: emiter,
            listener: listener
          });
        } else if (hash) {
          var defitem = {
            emiter: emiter,
            listener: listener
          };
          return argumentsHashReducer(hash, defitem, callback, context);
        } else {
          return [{
            eventName: undefined,
            callback: callback,
            context: context,
            emiter: emiter,
            listener: listener
          }];
        }
      }
    },
    trigger: {
      extractArgs: function extractArgs(args, _ref3) {
        var _this4 = this;

        var emiter = _ref3.emiter;
        var first = args.shift();

        if (!isString(first) && !isObj(first)) {
          return;
        }

        if (isString(first)) {
          return unString(first, {
            emiter: emiter,
            triggerArgs: args
          });
        } else {
          return Object.entries(first).reduce(function (memo, _ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                eventName = _ref5[0],
                triggerArgs = _ref5[1];

            _newArrowCheck(this, _this4);

            !isArr(triggerArgs) && (triggerArgs = args);
            var arr = unString(eventName, {
              emiter: emiter,
              triggerArgs: triggerArgs
            });
            memo.push.apply(memo, _toConsumableArray(arr));
            return memo;
          }.bind(this), []);
        }
      }
    }
  };
  /**
   * Helper to populate eventContext array from public methods.
   * The goal to process all possible variants of invoke arguments, normalized them and pass to the private api.
   * ('event', callback) => [{ eventName: 'event', callback }]
   * @private
   * @export
   * @param {*} context
   * @returns
   */

  function prepareApiArguments(context) {
    var type = context.type,
        _context$methodArgs = context.methodArgs,
        methodArgs = _context$methodArgs === void 0 ? [] : _context$methodArgs,
        listener = context.listener;

    if (!(type in prepareTypes)) {
      throw new Error('wrong prepare arguments type ' + type);
    }

    var options = _objectSpread2({
      takeEmiter: (type == 'add' || type == 'remove') && isObj(listener)
    }, context);

    return prepareTypes[type].extractArgs(methodArgs, options);
  }
  var eventsMixinSymbol = '_yaffevents';
  /**
   * Checks if argument supports Yaff events
   *
   * @export
   * @param {*} inst
   * @returns {boolean}
   */

  function isYaffEvents(inst) {
    return isObj(inst) && inst[eventsMixinSymbol] === true;
  } // split the event name on the ":"

  var splitter = /(^|:)(\w)/gi; // Only calc eventNameToMethodName once

  var methodCache = {};
  /**
   * Converts `event:name` to `onEventName`
   * @private
   * @export
   * @param {string} event
   * @returns
   */

  function eventNameToMethodName(event) {
    var _this5 = this;

    var name = methodCache[event];

    if (!name) {
      name = 'on' + event.replace(splitter, function (match, prefix, eventName) {
        _newArrowCheck(this, _this5);

        return eventName.toUpperCase();
      }.bind(this));
      methodCache[event] = name;
    }

    return name;
  }

  var objectMap = new WeakMap();
  var eventsHandlers = new Map();
  var interops = new Map();
  /**
   * @typedef {Object} interop
   * @property {function} on - Registers provided callback for event
   * @property {function} off - Removes provided callback for event
   */

  /**
   *  Fallback to default event api: `on` and `off`
   * @private
   * @param {*} emiter
   * @returns {interop}
   */

  function defaultInterop(emiter) {
    var _this = this;

    var supportsOn = isFunc(emiter.on);
    if (!supportsOn) throw new Error('Unable to listen this object');
    return {
      on: function on(emiter, listener, eventName, callback) {
        _newArrowCheck(this, _this);

        return emiter.on(eventName, callback, listener);
      }.bind(this),
      off: function off(emiter, listener, eventName, callback) {
        _newArrowCheck(this, _this);

        return emiter.off(eventName, callback, listener);
      }.bind(this)
    };
  }
  /**
   * Retrieves interop from the store. If there is no any associated interops for given instance then default one will be returned
   * @private
   * @export
   * @param {object} instance
   * @returns {interop}
   */


  function getInterop(instance) {
    var interop = interops.get(instance.constructor);

    if (interop) {
      return interop;
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = interops.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (instance instanceof key) {
          return interops.get(key);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return defaultInterop(instance);
  }
  /**
   * Registers interop for given type.
   * There is a default interop which tries to use `on` and `off`
   * It will be applied if there is no any suitable registered interop
   * @example
   * // registering interop for Backbone's Model
   * setInterop(Backbone.Model, {
   *  on(emitter, listener, eventName, callback) {
   *    emitter.on(eventName, callback, listener);
   *  },
   *  off(emiter, listener, eventName, callback) {
   *    emitter.off(eventName, callback, listener);
   *  }
   * });
   * @export
   * @param {(Class|null)} type
   * @param {interop} interop
   */

  function setInterop(type, interop) {
    if (interop === null) {
      interops["delete"](type);
    } else {
      interops.set(type, interop);
    }
  }
  /**
   * Return unique object Id
   *
   * @private
   * @export
   * @param {object} obj
   * @param {string} prefix
   * @returns {string}
   */

  function getObjectId(obj, prefix) {
    !prefix && (prefix = 'obj');

    if (!(obj instanceof Object)) {
      throw new Error('Argument must be an object');
    }

    var id = objectMap.get(obj);

    if (id == null) {
      id = newid(prefix);
      objectMap.set(obj, id);
    }

    return id;
  }
  /**
   * Returns EventsHandler for given object.
   *
   * @export
   * @private
   * @param {object} instance
   * @param {function} createFn
   * @returns {EventsHandler}
   */

  function getFromStore(instance, createFn) {
    var instanceId = getObjectId(instance);
    var handler = eventsHandlers.get(instanceId);

    if (!handler) {
      handler = createFn(instanceId);
      eventsHandlers.set(instanceId, handler);
    }

    return handler;
  }

  /**
   * Represents event callback
   * @private
   * @export
   * @class CallbackContext
   */

  var CallbackContext =
  /*#__PURE__*/
  function () {
    function CallbackContext(eventName, options, onDestroy) {
      _classCallCheck(this, CallbackContext);

      var emiter = options.emiter,
          listener = options.listener,
          callback = options.callback,
          context = options.context,
          defaultContext = options.defaultContext,
          once = options.once;
      this.eventName = eventName;
      this.id = newid('evcbcntx');
      this.emiter = emiter;
      this.listener = listener;
      this.callback = callback;
      this.context = context || listener;
      this.defaultContext = defaultContext;
      this.once = once === true;
      this._onDestroy = onDestroy;

      if (isObj(emiter) && !isYaffEvents(emiter)) {
        this._initializeInterop();
      }
    }
    /**
     * In case emiter is not yaff events trying to provide interop helper
     * for registering and removing CallbackContext
     * @private
     * @memberof CallbackContext
     */


    _createClass(CallbackContext, [{
      key: "_initializeInterop",
      value: function _initializeInterop() {
        var emiter = this.emiter;
        var eventName = this.eventName;

        var callback = this._interopTrigger.bind(this);

        var interop = getInterop(emiter);
        this.interop = _objectSpread2({}, interop, {
          callback: callback
        });
        this.interop.on(emiter, this.listener, eventName, callback);
      }
      /**
       * interop's version of callback
       * @private
       * @param {*} args callback's arguments
       * @returns {*}
       * @memberof CallbackContext
       */

    }, {
      key: "_interopTrigger",
      value: function _interopTrigger() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return this.trigger(args);
      }
      /**
       * Invokes callback with provided arguments
       *
       * @param {any[]} args
       * @returns {*}
       * @memberof CallbackContext
       */

    }, {
      key: "trigger",
      value: function trigger(args) {
        if (this.calledOnce) return;

        if (this.once) {
          this.calledOnce = true;
          this.destroy();
        }

        if (this.callback) {
          if (!isFunc(this.callback)) {
            throw new Error(this.eventName + ' callback is not a function');
          }

          this.callback.apply(this.context || this.defaultContext, args);
        }
      }
      /**
       * Removes self from EventContext
       * @private
       * @memberof CallbackContext
       */

    }, {
      key: "destroy",
      value: function destroy() {
        this._onDestroy(this);

        this._destroyed = true;

        if (this.interop) {
          this.interop.off(this.emiter, this.listener, this.eventName, this.interop.callback);
        }
      }
    }]);

    return CallbackContext;
  }();

  function isBasePass(item, event, key) {
    var eventVal = event[key];
    var itemVal = item[key];
    var res = itemVal == null || eventVal == itemVal;
    return res;
  }

  function isPassKeys(item, event, keys) {
    var _this = this;

    var reducer = function reducer(isTrue, key) {
      _newArrowCheck(this, _this);

      return isTrue && isBasePass(item, event, key);
    }.bind(this);

    return keys.reduce(reducer, true);
  }

  var defaultKeys = ['eventName', 'emiter', 'listener', 'callback', 'context'];
  /**
   * Build calbackcontext predicate
   * @private
   * @export
   * @param {object} item
   * @param {string[]} [keys=defaultKeys]
   * @returns {function}
   */

  function createEventCallbackContextPredicate(item) {
    var _this2 = this;

    var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultKeys;
    return function (event) {
      _newArrowCheck(this, _this2);

      return isPassKeys(item, event, keys);
    }.bind(this);
  }

  /**
   * Represents callbackcontexts collection for named event
   * @private
   * @export
   * @class EventContext
   */

  var EventContext =
  /*#__PURE__*/
  function () {
    function EventContext(name) {
      _classCallCheck(this, EventContext);

      this.id = newid('evcntx');
      this.eventName = name;
      this.contexts = new Set();
    }
    /**
     * returns amount of registered callbackContexts
     * @readonly
     * @type {number}
     * @memberof EventContext
     */


    _createClass(EventContext, [{
      key: "trigger",

      /**
       * Invokes all registered callbacks with provided arguments
       * @private
       * @param {any[]} args
       * @param {object} options
       * @memberof EventContext
       */
      value: function trigger(args, options) {
        var allContext = options.allContext;
        var callbacks = this.getCallbacksArray();
        var allCallbacks = allContext ? allContext.getCallbacksArray() : [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var callback = _step.value;
            callback.trigger(args);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = allCallbacks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var allCb = _step2.value;
            !allCb.calledOnce && allCb.trigger([this.eventName].concat(_toConsumableArray(args)));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
      /**
       * returns array of CallbackContext
       * @returns {CallbackContext[]}
       * @memberof EventContext
       */

    }, {
      key: "getCallbacksArray",
      value: function getCallbacksArray() {
        return Array.from(this.contexts.values());
      }
      /**
       * Creates CallbackContext instance from given object
       * @static
       * @private
       * @param {object} callbackContext
       * @param {*} [{ emiterEventContext, listenerHandler }={}]
       * @returns {CallbackContext}
       * @memberof EventContext
       */

    }, {
      key: "add",

      /**
       * Creates CallbackContext from given object and adds it to the callbackcontext array
       * @private
       * @param {object} callbackContext
       * @returns {CallbackContext}
       * @memberof EventContext
       */
      value: function add(callbackContext) {
        var listener = callbackContext.listener;
        var listenerHandler = listener && EventsHandler.get(listener);
        var cb = EventContext.createCallbackContext(callbackContext, {
          emiterEventContext: this,
          listenerHandler: listenerHandler
        });
        this.contexts.add(cb);
        return cb;
      }
      /**
       * Builds predicate from prodived options and removes all callbackcontexts which are pass the predicate.
       * @private
       * @param {object} options
       * @memberof EventContext
       */

    }, {
      key: "remove",
      value: function remove(options) {
        var predicate = createEventCallbackContextPredicate(options);
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.contexts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var context = _step3.value;

            if (predicate(context, options)) {
              context.destroy();
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      /**
       * Internaly used in callbackcontext's destroy to remove reference from callbackcontext array
       * @private
       * @param {*} context
       * @memberof EventContext
       */

    }, {
      key: "_deleteCallback",
      value: function _deleteCallback(context) {
        this.contexts["delete"](context);
      }
    }, {
      key: "size",
      get: function get() {
        return this.contexts.size;
      }
    }], [{
      key: "createCallbackContext",
      value: function createCallbackContext(callbackContext) {
        var _this = this;

        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            emiterEventContext = _ref.emiterEventContext,
            listenerHandler = _ref.listenerHandler;

        var name = emiterEventContext && emiterEventContext.eventName || callbackContext.eventName;
        var cb = new CallbackContext(name, callbackContext, function (cb) {
          _newArrowCheck(this, _this);

          emiterEventContext && emiterEventContext._deleteCallback(cb);
          listenerHandler && listenerHandler._deleteListenTo(cb);
        }.bind(this));
        listenerHandler && listenerHandler._addListenTo(cb);
        return cb;
      }
    }]);

    return EventContext;
  }();

  /**
   * Represents Events handler for entity with rpovided id.
   * @private
   * @export
   * @class EventsHandler
   */

  var EventsHandler =
  /*#__PURE__*/
  function () {
    function EventsHandler(id) {
      _classCallCheck(this, EventsHandler);

      this.id = id;
      this.eventsContexts = new Map();
      this.listenTo = new Set();
    }
    /**
     * Returns EventContext for given eventName. If there is no such EventContext then it will be created, stored and returned
     * @param {*} eventName
     * @param {boolean} [dontCreate=false] - prvents creating new EventContext if there is no such
     * @returns {EventContext}
     * @memberof EventsHandler
     */


    _createClass(EventsHandler, [{
      key: "getEventContext",
      value: function getEventContext(eventName) {
        var dontCreate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var context = this.eventsContexts.get(eventName);

        if (!context && !dontCreate) {
          context = new EventContext(eventName);
          this.eventsContexts.set(eventName, context);
        }

        return context;
      }
      /**
       * Registers new event callbackcontext
       * @private
       * @param {object} context
       * @memberof EventsHandler
       */

    }, {
      key: "add",
      value: function add(context) {
        var eventContext = this.getEventContext(context.eventName);
        eventContext.add(context);
      }
      /**
       * Tries to remove all possible events callbacks by given options
       * @private
       * @param {object} options
       * @memberof EventsHandler
       */

    }, {
      key: "remove",
      value: function remove(options) {
        var eventContexts = [];

        if (options.eventName) {
          var cntx = this.getEventContext(options.eventName, true);
          cntx && eventContexts.push(cntx);
        } else {
          var cntxs = this.eventsContexts.values();
          eventContexts.push.apply(eventContexts, _toConsumableArray(cntxs));
        }

        for (var _i = 0, _eventContexts = eventContexts; _i < _eventContexts.length; _i++) {
          var eventContext = _eventContexts[_i];
          eventContext.remove(options);
        }
      }
      /**
       * Tries to find and remove CallbackContext from listener's listenTo collection by given options.
       * Internally called by static `removeEvents`
       * @private
       * @param {object} options
       * @memberof EventsHandler
       */

    }, {
      key: "removeListenTo",
      value: function removeListenTo(options) {
        var isThis = createEventCallbackContextPredicate(options);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.listenTo.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var cbcnt = _step.value;

            if (isThis(cbcnt)) {
              cbcnt.destroy();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      /**
       * Removes CallbackContext reference from the listener's listenTo collection.
       * Internaly called by CallbackContext destroy
       * @private
       * @param {*} callbackContext
       * @memberof EventsHandler
       */

    }, {
      key: "_deleteListenTo",
      value: function _deleteListenTo(callbackContext) {
        this.listenTo["delete"](callbackContext);
      }
      /**
       * Adds CallbackContext to the listener's listenTo collection if event registered with listener
       * @private
       * @param {CallbackContext} callbackContext
       * @memberof EventsHandler
       */

    }, {
      key: "_addListenTo",
      value: function _addListenTo(callbackContext) {
        this.listenTo.add(callbackContext);
      }
      /**
       * Tries to trigger event by given context
       * @private
       * @param {object} context
       * @memberof EventsHandler
       */

    }, {
      key: "trigger",
      value: function trigger(context) {
        var eventName = context.eventName,
            triggerArgs = context.triggerArgs;
        var eventContext = this.getEventContext(eventName, true);
        var allContext = this.getEventContext('all', true);

        if (eventContext) {
          eventContext.trigger(triggerArgs, {
            type: 'event',
            dontClone: false,
            allContext: allContext
          }) || undefined;
        } else if (allContext) {
          allContext.trigger([eventName].concat(_toConsumableArray(triggerArgs)), {
            type: 'all'
          });
        }
      }
      /**
       * Private api to convert any instance to a EventsHandler
       * @private
       * @static
       * @param {object} instance
       * @returns {EventsHandler}
       * @memberof EventsHandler
       */

    }], [{
      key: "get",
      value: function get(instance) {
        var _this = this;

        return getFromStore(instance, function (iid) {
          _newArrowCheck(this, _this);

          return new EventsHandler(iid);
        }.bind(this));
      }
      /**
       * Private api for registering events.
       * Called by events mixin `on`, `once`, `listenTo` and `listenToOnce`
       * @private
       * @static
       * @param {object[]} contexts
       * @memberof EventsHandler
       */

    }, {
      key: "addEvents",
      value: function addEvents(contexts) {
        if (!Array.isArray(contexts)) {
          return;
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = contexts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var context = _step2.value;

            if (!isFunc(context.callback) && isObj(context.listener)) {
              continue;
            } // if (context.callback && typeof context.callback != 'function') {
            //   // backbone test: if callback is truthy but not a function, `on` should throw an error just like jQuery
            //   throw new Error('callback must be a function');
            // }


            var handler = EventsHandler.get(context.emiter);
            handler.add(context);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
      /**
       * Private Api to triggering events
       * Called by events mixin `trigger` and `triggerMethod`
       * @private
       * @static
       * @param {object[]} contexts
       * @param {boolean} shouldTriggerMethod indicates should emiter's method be invoked or not
       * @returns {*}
       * @memberof EventsHandler
       */

    }, {
      key: "triggerEvents",
      value: function triggerEvents(contexts, shouldTriggerMethod) {
        if (!Array.isArray(contexts)) {
          return;
        }

        var result;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = contexts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var context = _step3.value;
            var eventName = context.eventName,
                emiter = context.emiter,
                triggerArgs = context.triggerArgs;

            if (shouldTriggerMethod) {
              var methodName = eventNameToMethodName(eventName);
              var method = emiter.getOnMethod(eventName, methodName);
              result = method && method.apply(emiter, triggerArgs);
            }

            var handler = EventsHandler.get(context.emiter);
            handler.trigger(context);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return result;
      }
      /**
       * Private Api for removing events
       * Called by events mixin `off` and `stopListening`
       * @private
       * @static
       * @param {object[]} contexts
       * @memberof EventsHandler
       */

    }, {
      key: "removeEvents",
      value: function removeEvents(contexts) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = contexts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var context = _step4.value;

            if (context.emiter) {
              var handler = EventsHandler.get(context.emiter);
              handler.remove(context);
            }

            if (context.listener) {
              var _handler = EventsHandler.get(context.listener);

              _handler && _handler.removeListenTo(context);
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    }]);

    return EventsHandler;
  }();

  var _Events;
  /**
   * Events mixin. Just mix it into your prorotypes
   * @mixin Events
   */

  var Events = (_Events = {}, _defineProperty(_Events, eventsMixinSymbol, true), _defineProperty(_Events, "on", function on(event, callback, context) {
    var argsContext = {
      type: 'add',
      methodArgs: [event, callback, context],
      emiter: this,
      defaultContext: this
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);
    return this;
  }), _defineProperty(_Events, "once", function once(event, callback, context) {
    var argsContext = {
      type: 'add',
      methodArgs: [event, callback, context],
      once: true,
      emiter: this,
      defaultContext: this
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);
    return this;
  }), _defineProperty(_Events, "listenTo", function listenTo(emitter, event, callback, context) {
    var argsContext = {
      type: 'add',
      methodArgs: [emitter, event, callback, context],
      listener: this,
      defaultContext: this
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);
    return this;
  }), _defineProperty(_Events, "listenToOnce", function listenToOnce(emitter, event, callback, context) {
    var argsContext = {
      type: 'add',
      methodArgs: [emitter, event, callback, context],
      listener: this,
      once: true,
      defaultContext: this
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);
    return this;
  }), _defineProperty(_Events, "off", function off(event, callback, context) {
    var argsContext = {
      type: 'remove',
      methodArgs: [event, callback, context],
      emiter: this,
      "default": [{
        emiter: this
      }]
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.removeEvents(eventsContexts);
    return this;
  }), _defineProperty(_Events, "stopListening", function stopListening(emitter, event, callback, context) {
    var argsContext = {
      type: 'remove',
      methodArgs: [emitter, event, callback, context],
      listener: this,
      "default": [{
        listener: this
      }]
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.removeEvents(eventsContexts);
    return this;
  }), _defineProperty(_Events, "trigger", function trigger(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argsContext = {
      type: 'trigger',
      methodArgs: [event].concat(args),
      emiter: this
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.triggerEvents(eventsContexts, false);
    return this;
  }), _defineProperty(_Events, "triggerMethod", function triggerMethod(event) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var argsContext = {
      type: 'trigger',
      methodArgs: [event].concat(args),
      emiter: this
    };
    var eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.triggerEvents(eventsContexts, true);
  }), _defineProperty(_Events, "getOnMethod", function getOnMethod(eventName, methodName) {
    return typeof this[methodName] == 'function' && this[methodName];
  }), _Events);

  exports.Events = Events;
  exports.setInterop = setInterop;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
