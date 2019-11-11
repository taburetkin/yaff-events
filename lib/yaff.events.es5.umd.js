(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('core-js/modules/es.symbol'), require('core-js/modules/es.symbol.description'), require('core-js/modules/es.symbol.iterator'), require('core-js/modules/es.array.iterator'), require('core-js/modules/es.function.bind'), require('core-js/modules/es.map'), require('core-js/modules/es.object.to-string'), require('core-js/modules/es.string.iterator'), require('core-js/modules/web.dom-collections.iterator'), require('core-js/modules/es.regexp.exec'), require('core-js/modules/es.string.replace'), require('core-js/modules/es.array.slice'), require('core-js/modules/es.array.concat'), require('core-js/modules/es.array.filter'), require('core-js/modules/es.array.for-each'), require('core-js/modules/es.array.index-of'), require('core-js/modules/es.object.keys'), require('core-js/modules/es.string.split'), require('core-js/modules/web.dom-collections.for-each'), require('core-js/modules/es.array.splice')) :
  typeof define === 'function' && define.amd ? define(['exports', 'core-js/modules/es.symbol', 'core-js/modules/es.symbol.description', 'core-js/modules/es.symbol.iterator', 'core-js/modules/es.array.iterator', 'core-js/modules/es.function.bind', 'core-js/modules/es.map', 'core-js/modules/es.object.to-string', 'core-js/modules/es.string.iterator', 'core-js/modules/web.dom-collections.iterator', 'core-js/modules/es.regexp.exec', 'core-js/modules/es.string.replace', 'core-js/modules/es.array.slice', 'core-js/modules/es.array.concat', 'core-js/modules/es.array.filter', 'core-js/modules/es.array.for-each', 'core-js/modules/es.array.index-of', 'core-js/modules/es.object.keys', 'core-js/modules/es.string.split', 'core-js/modules/web.dom-collections.for-each', 'core-js/modules/es.array.splice'], factory) :
  (global = global || self, factory(global.yaffEvents = {}));
}(this, function (exports) { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

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

  function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
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

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var _this = undefined;

  // split the event name on the ":"
  var splitter = /(^|:)(\w)/gi; // Only calc eventNameToMethodName once

  var methodCache = {}; // key for events handler

  var handlerSymbol = Symbol('eventshandler'); // split string events by space

  var eventNameSplitter = /\s+/g; // find all events predicate

  var findAllPredicate = function findAllPredicate(cb) {
    _newArrowCheck(this, _this);

    return cb.eventName === 'all';
  }.bind(undefined); // yaff events indicator

  var eventsMixinSymbol = Symbol('yaffevents'); // unmutable fallback empty array

  var emptyArray = [];
  function isYaffEvents(arg) {
    return arg && arg._yaffevents_ == eventsMixinSymbol;
  }
  function isFunc(arg) {
    return typeof arg === 'function';
  }
  function isObj(arg) {
    return arg !== null && _typeof(arg) === 'object';
  }
  /**
   * Converts `event:name` to `onEventName`
   * @private
   * @export
   * @param {string} event - event name
   * @returns {string} method name
   */

  function eventNameToMethodName(event) {
    var _this2 = this;

    var name = methodCache[event];

    if (!name) {
      name = 'on' + event.replace(splitter, function (match, prefix, eventName) {
        _newArrowCheck(this, _this2);

        return eventName.toUpperCase();
      }.bind(this));
      methodCache[event] = name;
    }

    return name;
  }

  var interops = new Map();
  /**
   * Fallback to default event api: `on` and `off`
   * @private
   * @param {*} emitter - emitter instance
   * @returns {interop} - default interop handler
   */

  function defaultInterop(emitter) {
    var _this = this;

    var supportsOn = isFunc(emitter.on);
    if (!supportsOn) throw new Error('Unable to listen this object');
    return {
      on: function on(_emiter, listener, eventName, callback) {
        _newArrowCheck(this, _this);

        return _emiter.on(eventName, callback, listener);
      }.bind(this),
      off: function off(_emiter, listener, eventName, callback) {
        _newArrowCheck(this, _this);

        return _emiter.off(eventName, callback, listener);
      }.bind(this)
    };
  }
  /**
   * Retrieves interop from the store. If there is no any associated interops for given instance then default one will be returned
   * @private
   * @export
   * @param {object} instance - emitter instance
   * @returns {interop} - interop handler
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
   * @param {Class} type - interop type
   * @param {interop} interop - interop handler
   * @return {void}
   */

  function setInterop(type, interop) {
    if (interop === null) {
      interops["delete"](type);
    } else {
      interops.set(type, interop);
    }
  }

  var Callback =
  /*#__PURE__*/
  function () {
    function Callback(eventName, callback, context, once, listener, eHandler, lHandler) {
      var _this = this;

      _classCallCheck(this, Callback);

      this.eventName = eventName;
      this.callback = callback;
      this.context = context;
      this.once = once;
      this.listener = listener;
      this.eHandler = eHandler;
      this.emitter = eHandler.obj;
      this.defaultContext = listener || this.emitter;

      if (this.listener) {
        this.lHandler = lHandler || handler(this.listener);
        this.lHandler.flatListenTos.push(this);

        if (!isYaffEvents(this.emitter)) {
          var interop = getInterop(this.emitter);

          var interopCallback = function interopCallback() {
            _newArrowCheck(this, _this);

            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return this.invoke(args);
          }.bind(this);

          interop.on(this.emitter, this.listener, this.eventName, interopCallback);

          this.removeInterop = function () {
            _newArrowCheck(this, _this);

            delete this.removeInterop;
            interop.off(this.emitter, this.listener, this.eventName, interopCallback);
          }.bind(this);
        }
      }
    }

    _createClass(Callback, [{
      key: "invoke",
      value: function invoke(args) {
        if (this.calledOnce) return;

        if (this.once) {
          this.calledOnce = true;
          this.destroy();
        }

        this.callback && this.callback.apply(this.context || this.defaultContext, args);
      }
    }, {
      key: "destroy",
      value: function destroy(eventsIndex, listenToIndex) {
        this.removeInterop && this.removeInterop();
        eventsIndex !== false && this._removeFromArray(this.eHandler.flatEvents);
        listenToIndex !== false && this.lHandler && this._removeFromArray(this.lHandler.flatListenTos);
      }
    }, {
      key: "_removeFromArray",
      value: function _removeFromArray(callbacks, index) {
        if (index == null) {
          index = callbacks.indexOf(this); //indexLookup(callbacks, this);
        } //let index = callbacks.indexOf(this); //indexLookup(callbacks, this);


        index > -1 && callbacks.splice(index, 1);
      }
      /*removeFromEvents() {
        let callbacks = this.eHandler.flatEvents;
        let index = indexLookup(callbacks, this);
        index > -1 && callbacks.splice(index, 1);
      }
      removeFromListenTo() {
        if (!this.lHandler) return;
        let callbacks = this.lHandler.flatListenTos;
        let index = indexLookup(callbacks, this);
        callbacks.splice(callbacks.indexOf(this), 1);
      }*/

    }]);

    return Callback;
  }();

  var _this13 = undefined;
  var EventsHandler =
  /*#__PURE__*/
  function () {
    function EventsHandler(obj) {
      _classCallCheck(this, EventsHandler);

      // instance
      this.obj = obj; // registered events callbacks

      this.flatEvents = []; // registered foreign callbacks (listenTo)

      this.flatListenTos = [];
    } //#region Adding event callbacks

    /**
     * Adds events callbacks by events hash
     *
     * @param {object} hash - events hash
     * @param {(object|void)} context - custom callback context
     * @param {(Boolean|void)} once - If true callback should be called only once
     * @param {(object|void)} listener - listener instance
     * @returns {void}
     * @memberof EventsHandler
     */


    _createClass(EventsHandler, [{
      key: "addHash",
      value: function addHash(hash, context, once, listener) {
        var _this = this;

        var listenerHandler = listener && handler(listener);
        Object.keys(hash).forEach(function (key) {
          _newArrowCheck(this, _this);

          return this.addString(key, hash[key], context, once, listener, listenerHandler);
        }.bind(this));
      }
      /**
       * Adds events by string name(s)
       *
       * @param {string} eventNames - event name, or names separated by space
       * @param {function} callback - callback
       * @param {(object|void)} context - custom callback context
       * @param {(Boolean|void)} once - If true callback should be called only once
       * @param {(object|void)} listener - listener instance
       * @param {(EventsHandler|void)} listenerHandler - listener's EventHandler instance
       * @return {void}
       * @memberof EventsHandler
       */

    }, {
      key: "addString",
      value: function addString(eventNames, callback, context, once, listener, listenerHandler) {
        var _this2 = this;

        if (eventNames.indexOf(' ') === -1) {
          this.addSingle(eventNames, callback, context, once, listener, listenerHandler);
        } else {
          listener && !listenerHandler && (listenerHandler = handler(listener));
          var names = eventNames.split(eventNameSplitter);
          names.forEach(function (eventName) {
            _newArrowCheck(this, _this2);

            return this.addSingle(eventName, callback, context, once, listener, listenerHandler);
          }.bind(this));
        }
      }
      /**
       * Adds single event callback
       *
       * @param {string} eventName - event's name
       * @param {function} callback - event's callback
       * @param {(object|void)} context - custom callback context
       * @param {(Boolean|void)} once - If true callback should be called only once
       * @param {(object|void)} listener - Listener instance
       * @param {(EventsHandler|void)} listenerHandler - Listener's EventHandler instance
       * @return {void}
       * @memberof EventsHandler
       */

    }, {
      key: "addSingle",
      value: function addSingle(eventName, callback, context, once, listener, listenerHandler) {
        var cb = new Callback(eventName, callback, context, once, listener, this, listenerHandler);
        this.flatEvents.push(cb);
      } //#endregion
      //#region Removing event callbacks

    }, {
      key: "removeAllEvents",
      value: function removeAllEvents() {
        var _this3 = this;

        destroyIfMatch(this.flatEvents, false, function (item, index) {
          _newArrowCheck(this, _this3);

          return item.destroy(false);
        }.bind(this), true);
        this.flatEvents.length = 0;
      }
    }, {
      key: "removeEvents",
      value: function removeEvents(event, callback, context) {
        var _this4 = this;

        if (typeof event === 'string') {
          this.removeStringEvents(event, callback, context);
        } else if (isObj(event)) {
          if (isObj(callback) && !context) {
            context = callback;
          }

          Object.keys(event).forEach(function (eventNames) {
            _newArrowCheck(this, _this4);

            return this.removeStringEvents(eventNames, event[eventNames], context);
          }.bind(this));
        } else {
          this.removeEventCallbacks(event, callback, context);
        }
      }
    }, {
      key: "removeStringEvents",
      value: function removeStringEvents(event, callback, context) {
        var _this5 = this;

        if (event.indexOf(' ') === -1) {
          return this.removeEventCallbacks(event, callback, context);
        }

        return event.split(eventNameSplitter).forEach(function (eventName) {
          _newArrowCheck(this, _this5);

          return this.removeEventCallbacks(eventName, callback, context);
        }.bind(this));
      }
    }, {
      key: "removeEventCallbacks",
      value: function removeEventCallbacks(eventName, callback, context) {
        var _this6 = this;

        var shouldBeRemoved = function shouldBeRemoved(exist) {
          _newArrowCheck(this, _this6);

          return isRemoveByValue('eventName', eventName, exist) && isRemoveByValue('callback', callback, exist) && (isRemoveByValue('context', context, exist) || exist.context != context && exist.listener == context);
        }.bind(this);

        destroyIfMatch(this.flatEvents, shouldBeRemoved, function (item, index) {
          _newArrowCheck(this, _this6);

          return item.destroy(index);
        }.bind(this));
      }
    }, {
      key: "removeAllListenTos",
      value: function removeAllListenTos() {
        var _this7 = this;

        destroyIfMatch(this.flatListenTos, false, function (item, index) {
          _newArrowCheck(this, _this7);

          return item.destroy(null, false);
        }.bind(this), true);
        this.flatListenTos.length = 0;
      }
    }, {
      key: "removeListenTos",
      value: function removeListenTos(eventName, callback, context, emitter) {
        var _this8 = this;

        var type = _typeof(eventName);

        if (eventName == null || type === 'string') {
          this.removeStringListenTos(eventName, callback, context, emitter);
        } else if (type === 'object') {
          if (isObj(callback) && !context) {
            context = callback;
          }

          if (!isFunc(callback)) {
            callback = void 0;
          }

          Object.keys(eventName).forEach(function (key) {
            _newArrowCheck(this, _this8);

            return this.removeStringListenTos(key, eventName[key] || callback, context, emitter);
          }.bind(this));
        }
      }
    }, {
      key: "removeStringListenTos",
      value: function removeStringListenTos(eventNames, callback, context, emitter) {
        var _this9 = this;

        if (eventNames == null || eventNames.indexOf(' ') == -1) {
          this.removeListenToCallbacks(eventNames, callback, context, emitter);
        } else {
          eventNames.split(eventNameSplitter).forEach(function (eventName) {
            _newArrowCheck(this, _this9);

            return this.removeListenToCallbacks(eventName, callback, context, emitter);
          }.bind(this));
        }
      }
    }, {
      key: "removeListenToCallbacks",
      value: function removeListenToCallbacks(eventName, callback, context, emitter) {
        var _this10 = this;

        var shouldBeRemoved = function shouldBeRemoved(exist) {
          _newArrowCheck(this, _this10);

          return isRemoveByValue('eventName', eventName, exist) && isRemoveByValue('callback', callback, exist) && isRemoveByValue('context', context, exist);
        }.bind(this);

        destroyIfMatch(this.flatListenTos, shouldBeRemoved, function (item, index) {
          _newArrowCheck(this, _this10);

          return item.destroy(null, index);
        }.bind(this));
      } //#endregion
      //#region Trigger events

    }, {
      key: "triggerOne",
      value: function triggerOne(eventName, args, shouldTriggerMethod) {
        var _this11 = this;

        var result;

        if (shouldTriggerMethod) {
          var methodName = eventNameToMethodName(eventName);
          var method = this.obj.getOnMethod(eventName, methodName);

          if (isFunc(method)) {
            result = method.apply(this.obj, args);
          }
        }

        var eventCbs = this.flatEvents.filter(function (cb) {
          _newArrowCheck(this, _this11);

          return cb.eventName == eventName;
        }.bind(this));
        var allCbs = this.flatEvents.filter(findAllPredicate);
        var len;

        if (eventCbs && (len = eventCbs.length)) {
          for (var x = 0; x < len; x++) {
            eventCbs[x].invoke(args);
          }
        }

        if (allCbs && (len = allCbs.length)) {
          var allargs = [eventName].concat(_toConsumableArray(args));

          for (var _x = 0; _x < len; _x++) {
            allCbs[_x].invoke(allargs);
          }
        }

        return result;
      }
    }, {
      key: "triggerString",
      value: function triggerString(event, args, shouldTriggerMethod) {
        if (event.indexOf(' ') === -1) {
          return this.triggerOne(event, args, shouldTriggerMethod);
        }

        var names = event.split(eventNameSplitter);
        var len = names.length;
        var result;

        for (var x = 0; x < len; x++) {
          result = this.triggerOne(names[x], args, shouldTriggerMethod);
        }

        return result;
      }
    }, {
      key: "triggerHash",
      value: function triggerHash(hash, shouldTriggerMethod) {
        var _this12 = this;

        var result;
        Object.keys(hash).forEach(function (key) {
          _newArrowCheck(this, _this12);

          return result = this.triggerString(key, hash[key] || emptyArray, shouldTriggerMethod);
        }.bind(this));
        return result;
      } //#endregion

    }]);

    return EventsHandler;
  }();
  function handler(instance, dontCreate) {
    var h = instance[handlerSymbol];

    if (!dontCreate && !h) {
      h = instance[handlerSymbol] = new EventsHandler(instance);
    }

    return h;
  }

  var isRemoveByValue = function isRemoveByValue(key, value, exist) {
    _newArrowCheck(this, _this13);

    return value == null || value == exist[key];
  }.bind(undefined);

  function destroyIfMatch(items, shouldBeDestroyed, destroy, noStepback) {
    if (!items || items.length === 0) return;

    for (var x = 0; x < items.length; x++) {
      var item = items[x];

      if (!shouldBeDestroyed || shouldBeDestroyed(item)) {
        destroy(item, x); //item.destroy
        // item.destroy.apply(item, args);

        if (!noStepback) {
          x--;
        }
      }
    }
  } //#endregion

  /**
   * Events mixin. Just mix it into your prototypes
   * @mixin Events
   */

  var Events = {
    /**
     * for interop detection
     * @private
    */
    _yaffevents_: eventsMixinSymbol,

    /**
     * Registers event(s) with given callback
     * @example <caption>single event with default context</caption>
     * let callback = function() { }
     * instance.on('some:event', callback);
     * @example <caption>single event with provided context</caption>
     * let callback = function() { }
     * let context = { some: 'context'};
     * instance.on('some:event', callback, context)
     * // `this` will be equal to `context`
     * @example <caption>multiple events with single callback</caption>
     * let callback = function() { }
     * instance.on('event1 event2', callback);
     * // will registers both `event1` and `event2` with `callback` and instance as context
     * @example <caption>multiple events by hash with default context</caption>
     * instance.on({
     *   event1: callback1,
     *   event2: callback2
     * });
     * // will registers `event1` with callback1 and `event2` with callback2 and instance as context for both
     *
     * @param {(string|object)} event - event name(s) or events hash
     * @param {(function|object)} [callback] - optional if event is events hash
     * @param {object} [context] - event callback context
     * @returns {*} this, chainable
     */
    on: function on(event, callback, context) {
      var len = arguments.length;

      if (len === 0 || len === 1 && !isObj(event)) {
        return this;
      }

      var ehandler = handler(this);

      if (typeof event === 'string') {
        ehandler.addString(event, callback, context, false);
        return this;
      } // this is for backbone compatability
      // this seems to me odd but i have to support it


      if (isObj(callback) && !context) {
        context = callback;
      }

      ehandler.addHash(event, context, false);
      return this;
    },

    /**
     * Registers event(s) with given callback which will be invoked only once
     * @see Events.on
     * @param {(string|object)} event - event(s) name or events hash
     * @param {(function|object)} [callback] - optional if event is events hash
     * @param {object} [context] - event callback context
     * @returns {*} this, chainable
     */
    once: function once(event, callback, context) {
      if (!arguments.length || arguments.length === 1 && !isObj(event)) {
        return this;
      }

      var ehandler = handler(this);

      if (typeof event === 'string') {
        ehandler.addString(event, callback, context, true);
        return this;
      } // this is for backbone compatability
      // this seems to me odd but i have to support it


      if (isObj(callback) && !context) {
        context = callback;
      }

      ehandler.addHash(event, context, true);
      return this;
    },

    /**
     * Registers event(s) callback(s) which should happens on given instance.
     * Just like `on` but first argument is an object which will trigger the event.
     * @example
     * listener.listenTo(emitter, 'event', callback);
     * listener.listenTo(emitter, 'event1 event2', callback, context);
     * listener.listenTo(emitter, { event1: callback1, event2: callback2 });
     * listener.listenTo(emitter, { event1: callback2, event2: context2 }, context);
     *
     *
     * @param {object} emitter - instance you want to listen
     * @param {(string|object)} event - event(s) name or events hash
     * @param {(function|object)} [callback] - callback if events is a string or optional context if events is a hash
     * @param {object} [context] - default event callback context if event is a string
     * @returns {*} this, chainable
     */
    listenTo: function listenTo(emitter, event, callback, context) {
      if (arguments.length < 2) {
        return this;
      }

      if (emitter == null) {
        return this;
      }

      if (arguments.length === 2 && !isObj(event)) {
        return this;
      }

      var ehandler = handler(emitter);

      if (typeof event === 'string') {
        ehandler.addString(event, callback, context, false, this);
        return this;
      }

      if (isObj(callback)) {
        context = callback;
      }

      ehandler.addHash(event, context, false, this);
      return this;
    },

    /**
     * Registers event(s) callback(s) which should happens on given instance only once.
     * Just like `once` but first argument is an object which will trigger the event.
     * @see Events.listenTo
     * @param {object} emitter - instance you want to listen
     * @param {(string|object)} event - event(s) name or events hash
     * @param {(function|object)} [callback] - callback if events is a string or optional context if events is a hash
     * @param {object} [context] - event callback context if event is a string
     * @returns {*} this, chainable
     */
    listenToOnce: function listenToOnce(emitter, event, callback, context) {
      if (arguments.length < 2) {
        return this;
      }

      if (emitter == null) {
        return this;
      }

      if (arguments.length === 2 && !isObj(event)) {
        return this;
      }

      var ehandler = handler(emitter);

      if (typeof event === 'string') {
        ehandler.addString(event, callback, context, true, this);
        return this;
      }

      if (isObj(callback)) {
        context = callback;
      }

      ehandler.addHash(event, context, true, this);
      return this;
    },

    /**
     * Will removes all registered events by given arguments.
     * Note that if some other instance listens for events on this object then those events will be unregistered too.
     * @example <caption>Without arguments</caption>
     * emitter.off();
     * // will remove all regsitered events
     *
     * @example <caption>By event name</caption>
     * emitter.on('this:event that:event', callback);
     * emitter.off('that:event');
     * // will remove `that:event` but `this:event` will be still there
     * // also multiple events woorks too:
     * emitter.off('that:event this:event');
     *
     * @example <caption>By callback</caption>
     * emitter.on({
     *   event1: callback1,
     *   event2: callback2,
     *   event3: callback2,
     * });
     * emitter.off(null, callback2);
     * // will remove `event2` and `event3` but `event1` will be still there
     *
     * @example <caption>By combination</caption>
     * emitter.off('event', callback);
     * // removes all `event` with registered `callback`
     *
     * @example <caption>With event hash</caption>
     * emitter.off({ event1: callback1, event2: null });
     * // will remove all `event1` with callback `callback1` and all `event2`
     *
     * @example <caption>With event hash and context</caption>
     * emitter.off({ event1: callback1, event2: null }, callbackContext);
     * // will remove:
     * // 1) all `event1` with callback `callback1` and context `callbackContext`
     * // 2) all `event2` with any callback and context `callbackContext`
     *
     * @example <caption>With just context</caption>
     * emitter.on('event1 event2', callback1, context);
     * emitter.on('event3', callback1);
     * emitter.off(null, null, context);
     * // will remove event1 and event2
     * @param {(string|object)} [event] - event name(s) or events hash
     * @param {function} [callback] - callback
     * @param {object} [context] - callback context
     * @returns {*} this, chainable
     */
    off: function off(event, callback, context) {
      var ehandler = handler(this, true);

      if (!ehandler) {
        return this;
      }

      if (arguments.length === 0) {
        ehandler.removeAllEvents();
        return this;
      }

      ehandler.removeEvents(event, callback, context);
      return this;
    },

    /**
     * Removes listening events by given arguments.
     * If no arguments was passed, then removes all registered `listenTo` events
     *
     * @example
     * listener.listenTo(emitter, 'event', callback1);
     * listener.listenTo(anotherEmitter, 'another:event', callback2);
     * listener.stopListening();
     * // will removes both
     *
     * @example <caption>Remove all for given emitter</caption>
     * listener.listenTo(emitter, 'event1', callback1);
     * listener.listenTo(emitter, 'event2', callback2);
     * listener.listenTo(anotherEmitter, 'event1', callback2);
     * listener.stopListening(emitter);
     * // will remove events registered on emitter
     *
     * @example <caption>when emitter not specified</caption>
     * listener.listenTo(emitter, 'event1', callback1);
     * listener.listenTo(emitter, 'event2', callback2);
     * listener.listenTo(anotherEmitter, 'event1', callback2);
     * listener.stopListening(null, 'event1');
     * // will remove all `event1`
     *
     * @example <caption>With events hash and specified emitter</caption>
     * listener.stopListening(emitter, {
     *   event1: callback,
     *   event2: null,
     * });
     * // will remove
     * // 1) event1 with callback for emitter
     * // 2) all event2 for emitter
     *
     * @example <caption>With events hash and not specified emitter</caption>
     * listener.stopListening(null, {
     *   event1: callback,
     *   event3: null
     * });
     * // will remove
     * // 1) event1 with callback for all emitters
     * // 2) all event2 for all emitters
     *
     * @param {object} [emitter] - emitter instance
     * @param {(string|object)} [event] - event name or events hash
     * @param {(callback|object)} [callback] - callback in case its a string event and context if its an events hash
     * @param {object} [context] - context in case it's a string event
     * @returns {*} this, chainable
     */
    stopListening: function stopListening(emitter, event, callback, context) {
      var lhandler = handler(this, true);

      if (!lhandler) {
        return this;
      }

      if (!arguments.length) {
        lhandler.removeAllListenTos();
        return this;
      }

      lhandler.removeListenTos(event, callback, context, emitter);
      return this;
    },

    /**
     * Trigger callbacks for the given events
     *
     * @example
     * emitter.on('event', (...args) => console.log(args));
     * emitter.trigger('event', 1,2,3);
     * // will triggers registered callback
     * // console output: [1,2,3]
     *
     * @example <caption>multiple events with same arguments</caption>
     * emitter.trigger('event1 event2', 1,2,3);
     * // will trigger event1 and event2 callbacks with given arguments
     *
     * @example <caption>multiple events with different arguments</caption>
     * emitter.trigger({
     *  event1: ['bar'],
     *  event2: null,
     * })
     * // will trigger `event1` with `bar`
     * // and event2 without arguments
     *
     * @param {(string|object)} event - event names or event hash
     * @param {...*} [args] - arguments to be passed, if event is a string
     * @returns {*} this, chainable
     */
    trigger: function trigger(event) {
      if (arguments.length === 0 || !event) {
        return this;
      }

      var ehandler = handler(this, true);

      if (!ehandler) {
        return this;
      }

      if (typeof event === 'string') {
        var args = arguments.length === 1 ? emptyArray : Array.prototype.slice.call(arguments, 1);
        ehandler.triggerString(event, args);
        return this;
      }

      if (isObj(event)) {
        ehandler.triggerHash(event);
      }

      return this;
    },

    /**
     * Same as `trigger` but also in first will try to invoke instance method(s) associated with eventName.
     * by default its a camel cased event name with prefix `on`,
     * but you can override this behavior with providing your own version of `getOnMethod`
     * @example
     * emitter.triggerMethod('event:one');
     * //in first will tries to invoke emitter.onEventOne method and returns its result
     *
     * emitter.on({
     *  event1: callback1,
     *  event2: callback2,
     * })
     * emitter.triggerMethod('event1 event1');
     * //execution order will be
     * // 1) emitter.onEvent1
     * // 2) callback1
     * // 3) emitter.onEvent2
     * // 4) callback2
     * // will return the result of `onEvent2`
     *
     * @param {(string|object)} event - event names or event hash
     * @param {...*} [args] - arguments to be passed if event is a string
     * @returns {*} last (in case of multiple events) result of invoked method
     */
    triggerMethod: function triggerMethod(event) {
      if (arguments.length === 0 || !event) {
        return this;
      }

      var ehandler = handler(this);

      if (typeof event === 'string') {
        var args = arguments.length === 1 ? emptyArray : Array.prototype.slice.call(arguments, 1);
        ehandler.triggerString(event, args);
        return ehandler.triggerString(event, args, true);
      }

      if (isObj(event)) {
        return ehandler.triggerHash(event, true);
      }
    },

    /**
     * Will returns emitter's own method for given eventName.
     * Internally used by `triggerMethod`, feel free to override
     * @example <caption>override to respect emitter's `options`</caption>
     * emitter.getOnMethod = function(eventName, methodName) {
     *  if (typeof this.options[methodName] === 'function') {
     *    return this.options[methodName]; //no need to bind, it will be called with emitter as context
     *  }
     *  return typeof this[methodName] === 'function' && this[methodName];
     * }
     * @param {string} eventName - triggered event name
     * @param {string} methodName - suggested method name: for `event:one` it will be `onEventOne`
     * @returns {(function|falsy)} - returns method for `triggerMethod`
     */
    getOnMethod: function getOnMethod(eventName, methodName) {
      return typeof this[methodName] == 'function' && this[methodName];
    }
  };

  exports.Events = Events;
  exports.setInterop = setInterop;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
