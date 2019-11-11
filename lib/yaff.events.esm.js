// split the event name on the ":"
const splitter = /(^|:)(\w)/gi;
// Only calc eventNameToMethodName once
const methodCache = {};
// key for events handler
const handlerSymbol = Symbol('eventshandler');
// split string events by space
const eventNameSplitter = /\s+/g;
// find all events predicate
//export const findAllPredicate = cb => cb && cb.eventName === 'all';

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

/*
export function indexLookup(items, item) {
  let len = items.length;
  let half = len / 2 >> 0;
  let tail = len % 2;
  let left = 0;
  let right = len - 1;
  let inc = 0;
  while (left < half) {
    if (items[left] === item) return left;
    if (items[right] === item) return right;
    left++;
    right = len - left - 1;
    inc++;
    if (inc > 1000) {
      throw new Error('oops');
    }
  }
  if (tail && items[left] === item) {
    return left;
  }
  return -1;
}
*/

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

let gccounter = 0;
class Callback {
  constructor(eventName, callback, context, once, listener, eHandler, lHandler) {
    this.id = ++gccounter;
    this.eventName = eventName;
    this.callback = callback;
    this.context = context;
    this.once = once;
    this.listener = listener;
    //this.eHandler = eHandler;
    this.emitter = eHandler.obj;
    this.defaultContext = listener || this.emitter;

    if (this.listener) {
      this.lHandler = lHandler || handler(this.listener);
      this._listen = this.lHandler.listenTos.push(eHandler);

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
    if (this.calledOnce) return this;
    if (this.once) {
      this.calledOnce = true;
      this.destroy();
    }
    this.callback && this.callback.apply(this.context || this.defaultContext, args);
    return this;
  }
  destroy() {

    this.removeInterop && this.removeInterop();
    this.removeListenTo();
    this.removeEvent();

  }
  removeListenTo() {
    if (this._listen) {
      this._listen.count--;
      if (!this._listen.count) {
        this.lHandler.listenTos.delete(this._listen);
        this._listen = null;
      }
    }
  }
  removeEvent() {
    this._event[this._eventIndex] = null;
  }
}

let idcounter = 0;

const cloneArray = Array.prototype.slice;

class EventsHandler {

  constructor(obj) {
    this.id = ++idcounter;
    this.obj = obj;
    this.events = new EventsList(this);
    this.listenTos = new EmittersList(obj);
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
      !listenerHandler && listener && (listenerHandler = handler(listener));
      let names = eventNames.split(eventNameSplitter);
      let len = names.length;
      for (let x = 0; x < len; x++) {
        this.addSingle(names[x], callback, context, once, listener, listenerHandler);
      }
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
    this.events.addEventCallback(cb);
  }

  //#endregion


  //#region Removing event callbacks

  /**
   * Removes All events callbacks.
   * @return {void}
   * @memberof EventsHandler
   */
  removeAllEvents() {
    this.events.remove();
  }


  /**
   * Removes events callbacks by given arguments
   *
   * @param {(string|object)} event - event Names or event hash
   * @param {(function|object)} callback - event callback if event is string or event callback context in case event is hash
   * @param {object} context - event callback context
   * @return {void}
   * @memberof EventsHandler
   */
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

  /**
   * Removes string events
   * @return {void}
   * @param {string} event - event name(s)
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @return {void}
   * @memberof EventsHandler
   */
  removeStringEvents(event, callback, context) {
    if (event.indexOf(' ') === -1) {
      return this.removeEventCallbacks(event, callback, context);
    }
    return event.split(eventNameSplitter).forEach(eventName => this.removeEventCallbacks(eventName, callback, context));
  }

  /**
   * Removes event from stores.
   * @return {void}
   * @param {string} eventName - single event name
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @param {*} listener - event listener
   * @memberof EventsHandler
   */
  removeEventCallbacks(eventName, callback, context, listener) {
    return this.events.remove(eventName, callback, context, listener);
  }

  /**
   * Removes all registered events on each emitter
   * @return {void}
   * @memberof EventsHandler
   */
  removeAllListenTos() {
    this.listenTos.remove();
  }

  /**
   * Removes registered emitters events by predicate
   * @return {void}
   * @param {(string|object)} eventName - event Name(s) or events hash
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @param {object} emitter - event emitter instance
   * @memberof EventsHandler
   */
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

  /**
   * Removes registered emitters events by predicate
   * @return {void}
   * @param {string} eventNames - event Name(s)
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @param {object} emitter - event emitter instance
   * @memberof EventsHandler
   */
  removeStringListenTos(eventNames, callback, context, emitter) {
    if (eventNames == null || eventNames.indexOf(' ') == -1) {
      this.removeListenToCallbacks(eventNames, callback, context, emitter);
    } else {
      eventNames.split(eventNameSplitter).forEach(eventName => this.removeListenToCallbacks(eventName, callback, context, emitter));
    }
  }

  /**
   * Removes registered emitters events by predicate
   * @return {void}
   * @param {string} eventName - single event name
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @param {object} emitter - event emitter instance
   * @memberof EventsHandler
   */
  removeListenToCallbacks(eventName, callback, context, emitter) {
    this.listenTos.remove(emitter && handler(emitter).id, eventName, callback, context);
  }

  //#endregion


  //#region Trigger events

  /**
   * Triggers all callbacks for given single event name
   *
   * @param {string} eventName - event name;
   * @param {Array<*>} args - trigger arguments
   * @param {Boolean} shouldTriggerMethod - indicates should we try to invoke onMethod on emitter
   * @returns {void}
   * @memberof EventsHandler
   */
  triggerOne(eventName, args, shouldTriggerMethod) {

    let result;
    if (shouldTriggerMethod) {
      let methodName = eventNameToMethodName(eventName);
      let method = this.obj.getOnMethod(eventName, methodName);
      if (isFunc(method)) {
        result = method.apply(this.obj, args);
      }
    }

    let eventCbs = this.events.getCallbacks(eventName);
    let allCbs = this.events.getCallbacks('all');
    eventCbs.length && this._triggerCallbacks(eventCbs, args);
    allCbs.length && this._triggerCallbacks(allCbs, args, eventName);

    return result;
  }

  /**
   * Invokes all given callbacks with correct arguments
   * Internaly called by `triggerOne`
   * @param {Calback[]} cbs - callbacks
   * @param {Array<*>} args - arguments for callback invoke
   * @param {string} eventName - if passed will be added to the `args` as first element. used for `all`
   * @returns {void}
   * @memberof EventsHandler
   */
  _triggerCallbacks(cbs, args, eventName) {
    let len = cbs.length;
    if (eventName) {
      args = [eventName, ...args];
    }
    for (let x = 0; x < len; x++) {
      let ecb = cbs[x];
      if (!ecb) continue;
      ecb.invoke(args);
    }
  }

  /**
   * Triggers callbacks for string event
   *
   * @param {string} event - event name(s)
   * @param {Array<*>} args - arguments for callback invoke
   * @param {boolean} shouldTriggerMethod - indicates if there should be own method invoked
   * @returns {*} - will return last result of triggered own methods
   * @memberof EventsHandler
   */
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

  /**
   * Triggers callbacks for given events hash
   *
   * @param {object} hash - events hash
   * @param {boolean} shouldTriggerMethod - indicates if there should be own method invoked
   * @returns {*} - will return last result of triggered own methods
   * @memberof EventsHandler
   */
  triggerHash(hash, shouldTriggerMethod) {
    let result;
    Object.keys(hash).forEach(key => result = this.triggerString(key, hash[key] || emptyArray, shouldTriggerMethod));
    return result;
  }

  //#endregion

}

/**
 * Converts given instance to EventsHandler
 *
 * @export
 * @param {*} instance - any eventable instance
 * @param {*} dontCreate - If true will not auto create instance
 * @returns {EventsHandler} - EventsHandler instance for given object
 */
function handler(instance, dontCreate) {
  let h = instance[handlerSymbol];
  if (!dontCreate && !h) {
    h = instance[handlerSymbol] = new EventsHandler(instance);
  }
  return h;
}


/**
 * For registering foreign events.
 * Used on `listener` when you do `listener.listenTo(...)`
 * There is only reference with counter for better performance
 * @class EmittersList
 */
class EmittersList {
  constructor(listener) {
    this.ids = {};
    this.array = [];
    this.obj = listener;
    this._needReindex = 0;
  }

  /**
   * Internal helper for listeners.
   * Creates emitter's context with events counter.
   * Holds reference to emitters EventsHandlers.
   * Called in Callback constructor if there is a listener exist
   * @param {Callback} obj - Added `Callback`
   * @returns {object} - emitter's context
   * @memberof EmittersList
   */
  push(obj) {
    this.rebuildIndexes();
    let _obj = this.ids[obj.id];
    if (!_obj) {
      _obj = { id: obj.id, h: obj, index: this.array.length, count: 0 };
      this.ids[obj.id] = _obj;
      this.array.push(_obj);
    }
    _obj.count++;
    return _obj;
  }

  /**
   * Just helper to iterate over all listeners events
   * @param {function} cb - iteratee callback
   * @returns {void}
   * @memberof EmittersList
   */
  forEachEvent(cb) {
    this.array.forEach(em => em && em.h.events.forEachEvent(cb));
  }

  /**
   * I am avoiding to modify array by clone or splice,
   * So deleting is just removes reference from the array and hashmap
   * @param {object} arg - emitter's context
   * @returns {void}
   * @memberof EmittersList
   */
  delete(arg) {
    let _x = this.ids[arg.id];
    this.array[_x.index] = null;
    delete this.ids[arg.id];
    this._needReindex++;
  }

  /**
   * Internally called by `stopListening`.
   * Removes emitter's event callbacks by given parameters
   * @param {number} emitterId - internal emitter's eventshandler id
   * @param {string} eventName - potential event name
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @returns {void}
   * @memberof EmittersList
   */
  remove(emitterId, eventName, callback, context) {
    if (emitterId) {
      let emitter = this.ids[emitterId];
      if (!emitter) return;
      emitter && emitter.h.removeEventCallbacks(eventName, callback, context, this.obj);
      return;
    }
    this.array.forEach(em => {
      em && em.h.removeEventCallbacks(eventName, callback, context, this.obj);
    });
    this.rebuildIndexes();
  }

  /**
   * Rebuilds indexes for fast access and removes `null` entries from array
   * @returns {void}
   * @memberof EmittersList
   */
  rebuildIndexes() {
    if (this._needReindex < 1) return;
    let ind = 0;
    this.array = this.array.filter(it => {
      if (!it) {
        return false;
      }
      it.index = ind;
      ind++;
      return true;
    });
    this._needReindex = 0;
  }
}

/**
 * Emitters events store.
 * Used on emitter when you do `emitter.on(...)` or `listener.listenTo(emitter, ...)`
 * @class EventsList
 */
class EventsList {
  constructor(emitter) {
    this.ids = {};
    this.array = [];
    this.obj = emitter;
  }
  /**
   * Registers event's callback
   * @returns {void}
   * @param {Callback} cb - event's callback
   * @memberof EventsList
   */
  addEventCallback(cb) {
    let event = this.ids[cb.eventName];
    if (!event) {
      event = this.ids[cb.eventName] = [];
      event._index = this.array.length;
      event.id = cb.eventName;
      this.array.push(event);
    }
    // this is for callback.destroy();
    // for better performance
    cb._event = event;
    cb._eventIndex = event.length;
    event.push(cb);
  }
  /**
   * Returns cloned callbacks array for given event
   *
   * @param {string} eventName - event name
   * @returns {Callback[]} - callbacks array clone
   * @memberof EventsList
   */
  getCallbacks(eventName) {
    let cbs = this.ids[eventName];
    if (!cbs || !cbs.length) return emptyArray;
    return cloneArray.call(cbs, 0);
  }

  /**
   * Helper to iterate over all callbacks of all events
   * @returns {void}
   * @param {function} cb iteratee callback
   * @memberof EventsList
   */
  forEachEvent(cb) {
    this.array.forEach(cbs => cbs.forEach(cb));
  }
  /**
   * Internally called by `stopListening` and `off`.
   * Removes emitter's event callbacks by given parameters
   * @param {string} eventName - potential event name
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @param {object} listener - listener instance
   * @returns {void}
   * @memberof EmittersList
   */
  remove(eventName, callback, context, listener) {
    if (eventName != null) {
      let store = this.ids[eventName];
      if (!store) return;
      return this._removeBy(eventName, store, callback, context, listener);
    }
    let len1 = this.array.length;
    if (callback == null && context == null && listener == null) {
      for (let x = 0; x < len1; x++) {
        let cbs = this.array[x];
        let len2 = cbs.length;
        for (let y = 0; y < len2; y++) {
          let cb = cbs[y];
          cb.removeListenTo();
        }
      }
      this.ids = {};
      this.array = [];
      return;
    }
    for (let x = 0; x < len1; x++) {
      let items = this.array[x];
      this._removeBy(items.id, items, callback, context, listener);
    }
  }

  /**
   * Processes the event callbacks array
   * Invokes `destroy` on callbacks that should be removed
   *
   * @param {string} eventName - event name
   * @param {Callback[]} items - event registered Callbacks
   * @param {function} callback - event callback
   * @param {object} context - event callback context
   * @param {object} listener - event's listener
   * @returns {void}
   * @memberof EventsList
   */
  _removeBy(eventName, items, callback, context, listener) {
    let arindex = items._index;
    let newitems = this.ids[eventName] = items.filter((cb) => {
      if (!cb) { return false; }
      if (
        (callback == null || callback == cb.callback)
        && (context == null || context == cb.context || cb.listener && context == cb.listener)
        && (listener == null || listener == cb.listener)
      ) {
        cb.destroy();
        return false;
      }
      return true;
    });
    newitems.id = eventName;
    newitems._index = arindex;
    this.array[arindex] = newitems;
  }
}

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
