// split the event name on the ":"
const splitter = /(^|:)(\w)/gi;
// Only calc eventNameToMethodName once
const methodCache = {};
// key for events handler
const handlerSymbol = Symbol('eventshandler');
// split string events by space
const eventNameSplitter = /\s+/g;
// find all events predicate
const findAllPredicate = cb => cb.eventName === 'all';

// yaff events indicator
const eventsMixinSymbol = Symbol('yaffevents');

// unmutable fallback empty array
const emptyArray = [];

function isYaffEvents(arg) {
  return arg && arg._yaffevents_ == eventsMixinSymbol;
}

function isFunc(arg) {
  return typeof arg === 'function';
}


function isObj(arg) {
  return arg !== null && typeof arg === 'object';
}

/**
 * Converts `event:name` to `onEventName`
 * @private
 * @export
 * @param {string} event - event name
 * @returns {string} method name
 */
function eventNameToMethodName(event) {
  let name = methodCache[event];
  if (!name) {
    name =
      'on' +
      event.replace(splitter, (match, prefix, eventName) =>
        eventName.toUpperCase()
      );
    methodCache[event] = name;
  }
  return name;
}

const interops = new Map();

/**
 * Fallback to default event api: `on` and `off`
 * @private
 * @param {*} emitter - emitter instance
 * @returns {interop} - default interop handler
 */
function defaultInterop(emitter) {
  let supportsOn = isFunc(emitter.on);
  if (!supportsOn) throw new Error('Unable to listen this object');
  return {
    on: (_emiter, listener, eventName, callback) =>
      _emiter.on(eventName, callback, listener),
    off: (_emiter, listener, eventName, callback) =>
      _emiter.off(eventName, callback, listener)
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
  let interop = interops.get(instance.constructor);
  if (interop) {
    return interop;
  }
  for (let key of interops.keys()) {
    if (instance instanceof key) {
      return interops.get(key);
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
    interops.delete(type);
  } else {
    interops.set(type, interop);
  }
}

class Callback {
  constructor(eventName, callback, context, once, listener, eHandler, lHandler) {
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
        let interop = getInterop(this.emitter);
        let interopCallback = (...args) => this.invoke(args);
        interop.on(this.emitter, this.listener, this.eventName, interopCallback);
        this.removeInterop = () => {
          delete this.removeInterop;
          interop.off(this.emitter, this.listener, this.eventName, interopCallback);
        };
      }
    }
  }
  invoke(args) {
    if (this.calledOnce) return;
    if (this.once) {
      this.calledOnce = true;
      this.destroy();
    }
    this.callback && this.callback.apply(this.context || this.defaultContext, args);
  }
  destroy(eventsIndex, listenToIndex) {
    this.removeInterop && this.removeInterop();
    eventsIndex !== false && this._removeFromArray(this.eHandler.flatEvents);
    listenToIndex !== false && this.lHandler && this._removeFromArray(this.lHandler.flatListenTos);
  }
  _removeFromArray(callbacks, index) {
    if (index == null) {
      index = callbacks.indexOf(this); //indexLookup(callbacks, this);
    }
    //let index = callbacks.indexOf(this); //indexLookup(callbacks, this);
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
}

class EventsHandler {

  constructor(obj) {
    // instance
    this.obj = obj;
    // registered events callbacks
    this.flatEvents = [];
    // registered foreign callbacks (listenTo)
    this.flatListenTos = [];
  }


  //#region Adding event callbacks

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
  addHash(hash, context, once, listener) {
    let listenerHandler = listener && handler(listener);
    Object.keys(hash).forEach(key =>
      this.addString(key, hash[key], context, once, listener, listenerHandler)
    );
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
  addString(eventNames, callback, context, once, listener, listenerHandler) {
    if (eventNames.indexOf(' ') === -1) {
      this.addSingle(eventNames, callback, context, once, listener, listenerHandler);
    } else {
      listener && !listenerHandler && (listenerHandler = handler(listener));
      let names = eventNames.split(eventNameSplitter);
      names.forEach(eventName =>
        this.addSingle(eventName, callback, context, once, listener, listenerHandler)
      );
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
  addSingle(eventName, callback, context, once, listener, listenerHandler) {
    let cb = new Callback(eventName, callback, context, once, listener, this, listenerHandler);
    this.flatEvents.push(cb);
  }

  //#endregion


  //#region Removing event callbacks

  removeAllEvents() {
    destroyIfMatch(this.flatEvents, false, (item, index) => item.destroy(false), true);
    this.flatEvents.length = 0;
  }

  removeEvents(event, callback, context) {
    if (typeof event === 'string') {

      this.removeStringEvents(event, callback, context);

    } else if (isObj(event)) {
      if (isObj(callback) && !context) {
        context = callback;
      }
      Object.keys(event).forEach(eventNames => this.removeStringEvents(eventNames, event[eventNames], context));
    } else {
      this.removeEventCallbacks(event, callback, context);
    }
  }

  removeStringEvents(event, callback, context) {
    if (event.indexOf(' ') === -1) {
      return this.removeEventCallbacks(event, callback, context);
    }
    return event.split(eventNameSplitter).forEach(eventName => this.removeEventCallbacks(eventName, callback, context));
  }

  removeEventCallbacks(eventName, callback, context) {

    let shouldBeRemoved = exist => isRemoveByValue('eventName', eventName, exist)
      && isRemoveByValue('callback', callback, exist)
      && (isRemoveByValue('context', context, exist) || (exist.context != context && exist.listener == context));

    destroyIfMatch(this.flatEvents, shouldBeRemoved, (item, index) => item.destroy(index));
  }

  removeAllListenTos() {
    destroyIfMatch(this.flatListenTos, false, (item, index) => item.destroy(null, false), true);
    this.flatListenTos.length = 0;
  }

  removeListenTos(eventName, callback, context, emitter) {
    let type = typeof eventName;
    if (eventName == null || type === 'string') {

      this.removeStringListenTos(eventName, callback, context, emitter);

    } else if (type === 'object') {

      if (isObj(callback) && !context) {
        context = callback;
      }
      if (!isFunc(callback)) {
        callback = void 0;
      }
      Object.keys(eventName).forEach(key => this.removeStringListenTos(key, eventName[key] || callback, context, emitter));
    }
  }

  removeStringListenTos(eventNames, callback, context, emitter) {
    if (eventNames == null || eventNames.indexOf(' ') == -1) {
      this.removeListenToCallbacks(eventNames, callback, context, emitter);
    } else {
      eventNames.split(eventNameSplitter).forEach(eventName => this.removeListenToCallbacks(eventName, callback, context, emitter));
    }
  }

  removeListenToCallbacks(eventName, callback, context, emitter) {
    let shouldBeRemoved = exist => isRemoveByValue('eventName', eventName, exist)
      && isRemoveByValue('callback', callback, exist)
      && isRemoveByValue('context', context, exist);

    destroyIfMatch(this.flatListenTos, shouldBeRemoved, (item, index) => item.destroy(null, index));
  }

  //#endregion


  //#region Trigger events

  triggerOne(eventName, args, shouldTriggerMethod) {

    let result;
    if (shouldTriggerMethod) {
      let methodName = eventNameToMethodName(eventName);
      let method = this.obj.getOnMethod(eventName, methodName);
      if (isFunc(method)) {
        result = method.apply(this.obj, args);
      }
    }

    let eventCbs = this.flatEvents.filter(cb => {
      return cb.eventName == eventName
    });
    let allCbs = this.flatEvents.filter(findAllPredicate);

    let len;
    if (eventCbs && (len = eventCbs.length)) {
      for (let x = 0; x < len; x++) {
        eventCbs[x].invoke(args);
      }
    }
    if (allCbs && (len = allCbs.length)) {
      let allargs = [eventName, ...args];
      for (let x = 0; x < len; x++) {
        allCbs[x].invoke(allargs);
      }
    }

    return result;
  }

  triggerString(event, args, shouldTriggerMethod) {

    if (event.indexOf(' ') === -1) {
      return this.triggerOne(event, args, shouldTriggerMethod);
    }

    let names = event.split(eventNameSplitter);
    let len = names.length;
    let result;
    for (let x = 0; x < len; x++) {
      result = this.triggerOne(names[x], args, shouldTriggerMethod);
    }
    return result;
  }

  triggerHash(hash, shouldTriggerMethod) {
    let result;
    Object.keys(hash).forEach(key => result = this.triggerString(key, hash[key] || emptyArray, shouldTriggerMethod));
    return result;
  }

  //#endregion

}

function handler(instance, dontCreate) {
  let h = instance[handlerSymbol];
  if (!dontCreate && !h) {
    h = instance[handlerSymbol] = new EventsHandler(instance);
  }
  return h;
}

//#region helpers

const isRemoveByValue = (key, value, exist) => value == null || value == exist[key];

function destroyIfMatch(items, shouldBeDestroyed, destroy, noStepback) {

  if (!items || items.length === 0) return;
  for (let x = 0; x < items.length; x++) {
    let item = items[x];
    if (!shouldBeDestroyed || shouldBeDestroyed(item)) {
      destroy(item, x);
      //item.destroy
      // item.destroy.apply(item, args);
      if (!noStepback) {
        x--;
      }
    }
  }
}


//#endregion

/**
 * Events mixin. Just mix it into your prototypes
 * @mixin Events
 */
const Events = {
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
  on(event, callback, context) {
    let len = arguments.length;
    if (len === 0 || (len === 1 && !isObj(event))) {
      return this;
    }
    let ehandler = handler(this);
    if (typeof event === 'string') {
      ehandler.addString(event, callback, context, false);
      return this;
    }
    // this is for backbone compatability
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
  once(event, callback, context) {
    if (
      !arguments.length
      || (arguments.length === 1 && !isObj(event))
    ) {
      return this;
    }
    let ehandler = handler(this);
    if (typeof event === 'string') {
      ehandler.addString(event, callback, context, true);
      return this;
    }
    // this is for backbone compatability
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
  listenTo(emitter, event, callback, context) {

    if (arguments.length < 2) {
      return this;
    }
    if (emitter == null) {
      return this;
    }
    if (arguments.length === 2 && !isObj(event)) {
      return this;
    }
    let ehandler = handler(emitter);
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
  listenToOnce(emitter, event, callback, context) {
    if (arguments.length < 2) {
      return this;
    }
    if (emitter == null) {
      return this;
    }
    if (arguments.length === 2 && !isObj(event)) {
      return this;
    }
    let ehandler = handler(emitter);
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
  off(event, callback, context) {
    let ehandler = handler(this, true);
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
  stopListening(emitter, event, callback, context) {
    let lhandler = handler(this, true);
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
  trigger(event) {
    if (arguments.length === 0 || !event) {
      return this;
    }
    let ehandler = handler(this, true);
    if (!ehandler) {
      return this;
    }

    if (typeof event === 'string') {
      let args = arguments.length === 1 ? emptyArray : Array.prototype.slice.call(arguments, 1);
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
  triggerMethod(event) {
    if (arguments.length === 0 || !event) {
      return this;
    }
    let ehandler = handler(this);
    if (typeof event === 'string') {
      let args = arguments.length === 1 ? emptyArray : Array.prototype.slice.call(arguments, 1);
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
  getOnMethod(eventName, methodName) {
    return typeof this[methodName] == 'function' && this[methodName];
  },

};

export { Events, setInterop };
