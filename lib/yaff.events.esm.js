let ids = {
  default: 0
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
  return eventNames.split(/\s+/g).map(eventName => ({ eventName, ...context }));
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

  let [first = defCb, second = defCnt] = arg;
  if (isObj(first) && arg.length == 1) {
    second = first;
    first = defCb;
  }
  if (first !== null) {
    first = (isFunc(first) && first) || void 0;
  } else {
    first = void 0;
  }
  if (second !== null) {
    second = (isObj(second) && second) || void 0;
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
  return Object.entries(hash).reduce((contexts, [eventNames, arg]) => {
    arg = normalizeHashArray(arg, defCallback, defContext);
    let [takeCallback, takeContext] = arg;
    let item = {
      callback: takeCallback,
      context: takeContext,
      ...defItem
    };
    let arr = unString(eventNames, item);
    contexts.push(...arr);
    return contexts;
  }, []);
}

let prepareTypes = {
  add: {
    extractArgs(args, options) {
      let { takeEmiter, listener, once, defaultContext } = options;

      let emiter = (takeEmiter && args.shift()) || options.emiter;
      let eventNames;
      let callback;
      let context;
      let [first, second, third] = args;
      callback = (isFunc(second) && second) || undefined;
      context =
        (isObj(third) && third) || (isObj(second) && second) || undefined;

      if (isString(first)) {
        eventNames = first;
        return unString(eventNames, {
          callback: callback || second, // backbone test: if callback is truthy but not a function, `on` should throw an error just like jQuery
          context,
          emiter,
          listener,
          once,
          defaultContext
        });
      } else if (isObj(first)) {
        let defitem = {
          emiter,
          listener,
          once,
          defaultContext
        };
        return argumentsHashReducer(first, defitem, callback, context);
      }
    }
  },
  remove: {
    takeEmiter(args, options) {
      if (options.takeEmiter) {
        if (isObj(args[0]) || args[0] === null) {
          let emiter = args.shift();
          return (emiter !== null && emiter) || void 0;
        }
      }
      return options.emiter;
    },
    extractArgs(args, options) {
      let emiter = this.takeEmiter(args, options);

      let listener = options.listener;
      let hash;
      let eventNames;
      let callback;
      let context;
      let [first, second, third] = args;

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
        return unString(eventNames, { callback, context, emiter, listener });
      } else if (hash) {
        let defitem = {
          emiter,
          listener
        };
        return argumentsHashReducer(hash, defitem, callback, context);
      } else {
        return [{ eventName: undefined, callback, context, emiter, listener }];
      }
    }
  },
  trigger: {
    extractArgs(args, { emiter }) {
      let first = args.shift();
      if (!isString(first) && !isObj(first)) {
        return;
      }
      if (isString(first)) {
        return unString(first, { emiter, triggerArgs: args });
      } else {
        return Object.entries(first).reduce(
          (memo, [eventName, triggerArgs]) => {
            !isArr(triggerArgs) && (triggerArgs = args);
            let arr = unString(eventName, { emiter, triggerArgs });
            memo.push(...arr);
            return memo;
          },
          []
        );
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
  let { type, methodArgs = [], listener } = context;

  if (!(type in prepareTypes)) {
    throw new Error('wrong prepare arguments type ' + type);
  }

  let options = {
    takeEmiter: (type == 'add' || type == 'remove') && isObj(listener),
    ...context
  };

  return prepareTypes[type].extractArgs(methodArgs, options);
}

const eventsMixinSymbol = Symbol('YaffEvents');

/**
 * Checks if argument supports Yaff events
 *
 * @export
 * @param {*} inst
 * @returns {boolean}
 */
function isYaffEvents(inst) {
  return inst && eventsMixinSymbol in inst;
}

// split the event name on the ":"
const splitter = /(^|:)(\w)/gi;
// Only calc eventNameToMethodName once
const methodCache = {};

/**
 * Converts `event:name` to `onEventName`
 * @private
 * @export
 * @param {string} event
 * @returns
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

const objectMap = new WeakMap();
const eventsHandlers = new Map();
const interops = new Map();

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
  let supportsOn = isFunc(emiter.on);
  if (!supportsOn) throw new Error('Unable to listen this object');
  return {
    on: (emiter, listener, eventName, callback) =>
      emiter.on(eventName, callback, listener),
    off: (emiter, listener, eventName, callback) =>
      emiter.off(eventName, callback, listener)
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
 * @param {(Class|null)} type
 * @param {interop} interop
 */
function setInterop(type, interop) {
  if (interop === null) {
    interops.delete(type);
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
  let id = objectMap.get(obj);
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
  let instanceId = getObjectId(instance);
  let handler = eventsHandlers.get(instanceId);
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
class CallbackContext {
  constructor(eventName, options, onDestroy) {
    let { emiter, listener, callback, context, defaultContext, once } = options;

    this.eventName = eventName;
    this.id = newid('evcbcntx');
    this.emiter = emiter;
    this.listener = listener;
    this.callback = callback;
    this.context = context || defaultContext;
    this.once = once === true;
    this._onDestroy = onDestroy;

    if (!isYaffEvents(emiter)) {
      this._initializeInterop();
    }
  }

  /**
   * In case emiter is not yaff events trying to provide interop helper
   * for registering and removing CallbackContext
   * @private
   * @memberof CallbackContext
   */
  _initializeInterop() {
    let emiter = this.emiter;
    let eventName = this.eventName;
    let callback = this._interopTrigger.bind(this);
    let interop = getInterop(emiter);
    this.interop = { ...interop };
    this.interop.callback = callback;
    this.interop.on(emiter, this.listener, eventName, callback);
  }

  /**
   * interop's version of callback
   * @private
   * @param {*} args callback's arguments
   * @returns {*}
   * @memberof CallbackContext
   */
  _interopTrigger(...args) {
    return this.trigger(args);
  }

  /**
   * Invokes callback with provided arguments
   *
   * @param {any[]} args
   * @returns {*}
   * @memberof CallbackContext
   */
  trigger(args) {
    if (typeof this.callback != 'function' || this.calledOnce) return;
    if (this.once) {
      this.calledOnce = true;
      this.destroy();
    }
    this.callback.apply(this.context, args);
  }

  /**
   * Removes self from EventContext
   * @private
   * @memberof CallbackContext
   */
  destroy() {
    this._onDestroy(this);
    this._destroyed = true;
    if (this.interop) {
      this.interop.off(
        this.emiter,
        this.listener,
        this.eventName,
        this.interop.callback
      );
    }
  }
}

function isBasePass(item, event, key) {
  let eventVal = event[key];
  let itemVal = item[key];
  let res = itemVal == null || eventVal == itemVal;
  return res;
}

function isPassKeys(item, event, keys) {
  let reducer = (isTrue, key) => isTrue && isBasePass(item, event, key);
  return keys.reduce(reducer, true);
}

const defaultKeys = ['eventName', 'emiter', 'listener', 'callback', 'context'];

/**
 * Build calbackcontext predicate
 * @private
 * @export
 * @param {object} item
 * @param {string[]} [keys=defaultKeys]
 * @returns {function}
 */
function createEventCallbackContextPredicate(item, keys = defaultKeys) {
  return event => isPassKeys(item, event, keys);
}

/**
 * Represents callbackcontexts collection for named event
 * @private
 * @export
 * @class EventContext
 */
class EventContext {
  constructor(name) {
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
  get size() {
    return this.contexts.size;
  }

  /**
   * Invokes all registered callbacks with provided arguments
   * @private
   * @param {any[]} args
   * @param {object} options
   * @memberof EventContext
   */
  trigger(args, options) {
    let { allContext } = options;

    let callbacks = this.getCallbacksArray();
    let allCallbacks = allContext ? allContext.getCallbacksArray() : [];

    for (let callback of callbacks) {
      callback.trigger(args);
    }

    for (let allCb of allCallbacks) {
      !allCb.calledOnce && allCb.trigger([this.eventName, ...args]);
    }
  }

  /**
   * returns array of CallbackContext
   * @returns {CallbackContext[]}
   * @memberof EventContext
   */
  getCallbacksArray() {
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
  static createCallbackContext(
    callbackContext,
    { emiterEventContext, listenerHandler } = {}
  ) {
    let name =
      (emiterEventContext && emiterEventContext.eventName) ||
      callbackContext.eventName;
    let cb = new CallbackContext(name, callbackContext, cb => {
      emiterEventContext && emiterEventContext._deleteCallback(cb);
      listenerHandler && listenerHandler._deleteListenTo(cb);
    });
    listenerHandler && listenerHandler._addListenTo(cb);
    return cb;
  }

  /**
   * Creates CallbackContext from given object and adds it to the callbackcontext array
   * @private
   * @param {object} callbackContext
   * @returns {CallbackContext}
   * @memberof EventContext
   */
  add(callbackContext) {
    let { listener } = callbackContext;
    let listenerHandler = listener && EventsHandler.get(listener);

    let cb = EventContext.createCallbackContext(callbackContext, {
      emiterEventContext: this,
      listenerHandler
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
  remove(options) {
    let predicate = createEventCallbackContextPredicate(options);
    for (let context of this.contexts) {
      if (predicate(context, options)) {
        context.destroy();
      }
    }
  }

  /**
   * Internaly used in callbackcontext's destroy to remove reference from callbackcontext array
   * @private
   * @param {*} context
   * @memberof EventContext
   */
  _deleteCallback(context) {
    this.contexts.delete(context);
  }
}

/**
 * Represents Events handler for entity with rpovided id.
 * @private
 * @export
 * @class EventsHandler
 */
class EventsHandler {
  constructor(id) {
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
  getEventContext(eventName, dontCreate = false) {
    let context = this.eventsContexts.get(eventName);
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
  add(context) {
    let eventContext = this.getEventContext(context.eventName);
    eventContext.add(context);
  }

  /**
   * Tries to remove all possible events callbacks by given options
   * @private
   * @param {object} options
   * @memberof EventsHandler
   */
  remove(options) {
    let eventContexts = [];
    if (options.eventName) {
      let cntx = this.getEventContext(options.eventName, true);
      cntx && eventContexts.push(cntx);
    } else {
      let cntxs = this.eventsContexts.values();
      eventContexts.push(...cntxs);
    }
    for (let eventContext of eventContexts) {
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
  removeListenTo(options) {
    let isThis = createEventCallbackContextPredicate(options);
    for (let cbcnt of this.listenTo.values()) {
      if (isThis(cbcnt)) {
        cbcnt.destroy();
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
  _deleteListenTo(callbackContext) {
    this.listenTo.delete(callbackContext);
  }

  /**
   * Adds CallbackContext to the listener's listenTo collection if event registered with listener
   * @private
   * @param {CallbackContext} callbackContext
   * @memberof EventsHandler
   */
  _addListenTo(callbackContext) {
    this.listenTo.add(callbackContext);
  }

  /**
   * Tries to trigger event by given context
   * @private
   * @param {object} context
   * @memberof EventsHandler
   */
  trigger(context) {
    let { eventName, triggerArgs } = context;

    let eventContext = this.getEventContext(eventName, true);
    let allContext = this.getEventContext('all', true);

    if (eventContext) {
      eventContext.trigger(triggerArgs, {
        type: 'event',
        dontClone: false,
        allContext
      }) || undefined;
    } else if (allContext) {
      allContext.trigger([eventName, ...triggerArgs], { type: 'all' });
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
  static get(instance) {
    return getFromStore(instance, iid => new EventsHandler(iid));
  }

  /**
   * Private api for registering events.
   * Called by events mixin `on`, `once`, `listenTo` and `listenToOnce`
   * @private
   * @static
   * @param {object[]} contexts
   * @memberof EventsHandler
   */
  static addEvents(contexts) {
    if (!Array.isArray(contexts)) {
      return;
    }
    for (let context of contexts) {
      if (context.callback && typeof context.callback != 'function') {
        // backbone test: if callback is truthy but not a function, `on` should throw an error just like jQuery
        throw new Error('callback must be a function');
      }
      let handler = EventsHandler.get(context.emiter);
      handler.add(context);
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
  static triggerEvents(contexts, shouldTriggerMethod) {
    if (!Array.isArray(contexts)) {
      return;
    }
    let result;
    for (let context of contexts) {
      let { eventName, emiter, triggerArgs } = context;

      if (shouldTriggerMethod) {
        let methodName = eventNameToMethodName(eventName);
        let method = emiter.getOnMethod(eventName, methodName);
        result = method && method.apply(emiter, triggerArgs);
      }

      let handler = EventsHandler.get(context.emiter);
      handler.trigger(context);
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
  static removeEvents(contexts) {
    for (let context of contexts) {
      if (context.emiter) {
        let handler = EventsHandler.get(context.emiter);
        handler.remove(context);
      }

      if (context.listener) {
        let handler = EventsHandler.get(context.listener);
        handler && handler.removeListenTo(context);
      }
    }
  }
}

/**
 * Events mixin. Just mix it into your prorotypes
 * @mixin Events
 */
const Events = {
  [eventsMixinSymbol]: true,

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
   * @example <caption>multiple events by hash with different contexts</caption>
   * instance.on({
   *   event1: [callback1, context1]
   *   event2: [callback2, context2]
   * });
   * // will registers `event1` with callback1 and context1 and `event2` with callback2 and context2
   * @example <caption>events hash mutations</caption>
   * { event: callback } is equal { event: [callback, undefined] }
   * { event: context } is equal { event: [undefined, context] }
   * { event: [callback] } is equal { event: [callback, undefined] }
   * { event: [context] } is equal { event: [undefined, context] }
   * { event: null } is equal { event: [null, null] }
   * // each `undefined` will fallback to appropriate default
   * // and `null` will prevent default for being used.
   *
   * instance.on({ event: [callback, null] }, defaultCallback, defaultContext)
   * // this will register event with callback and instance as context
   * // and equal instance.on(event, callback)
   *
   * instance.on({ event: callback }, defaultCallback, defaultContext)
   * // this will register event with callback and defaultContext as context
   * // and equal instance.on(event, callback, defaultContext)
   *
   * instance.on({ event: context }, defaultCallback, defaultContext)
   * // this will register event with defaultCallback and context as context
   * // and equal instance.on(event, defaultCallback, context)
   *
   * @param {(string|object)} event
   * @param {(function|object)} [callback] - optional if event is events hash
   * @param {object} [context]
   * @returns {*} this, chainable
   */
  on(event, callback, context) {
    let argsContext = {
      type: 'add',
      methodArgs: [event, callback, context],
      emiter: this,
      defaultContext: this
    };
    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);
    return this;
  },

  /**
   * Registers event(s) with given callback which will be invoked only once
   * @see Events.on
   * @param {(string|object)} event
   * @param {(function|object)} [callback] - optional if event is events hash
   * @param {object} [context]
   * @returns {*} this, chainable
   */
  once(event, callback, context) {
    let argsContext = {
      type: 'add',
      methodArgs: [event, callback, context],
      once: true,
      emiter: this,
      defaultContext: this
    };
    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);
    return this;
  },

  /**
   * Registers event(s) callback(s) which should happens on given instance.
   * Just like `on` but first argument is an object which will trigger the event.
   * @example
   * listener.listenTo(emitter, 'event', callback);
   * listener.listenTo(emitter, 'event', callback, customContext);
   *
   * @example <caption>also possible variants</caption>
   * listener.listenTo(emitter, { event1: callback1, event2: callback2 });
   * listener.listenTo(emitter, { event1: callback2, event2: context2 }, defaultCallback, defaultContext);
   * listener.listenTo(emitter, { event1: callback, event2: [callback, null] }, defaultContext);
   *
   * @param {object} emitter - instance you want to listen
   * @param {(string|object|function)} event
   * @param {(function|object)} [callback] - optional if event is events hash
   * @param {object} [context]
   * @returns {*} this, chainable
   */
  listenTo(emitter, event, callback, context) {
    let argsContext = {
      type: 'add',
      methodArgs: [emitter, event, callback, context],
      listener: this,
      defaultContext: this
    };
    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);
    return this;
  },

  /**
   * Registers event(s) callback(s) which should happens on given instance only once.
   * Just like `once` but first argument is an object which will trigger the event.
   * @see Events.listenTo
   * @param {object} emitter - instance you want to listen
   * @param {(string|object|function)} event
   * @param {(function|object)} [callback] - optional if event is events hash
   * @param {object} [context]
   * @returns {*} this, chainable
   */
  listenToOnce(emitter, event, callback, context) {
    let argsContext = {
      type: 'add',
      methodArgs: [emitter, event, callback, context],
      listener: this,
      once: true,
      defaultContext: this
    };

    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.addEvents(eventsContexts);

    return this;
  },

  /**
   * Will removes all registered events by given arguments.
   * Note that if some instance listens for events on this object then those events will be unregistered too.
   * So `all` means completely all events.
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
   * emitter.off(callback2);
   * // will remove `event2` and `event3` but `event1` will be still there
   *
   * @example <caption>By context</caption>
   * emitter.on({
   *   event1: [callback1, context1],
   *   event2: [callback2, context1],
   *   event3: callback3,
   * });
   * emitter.off(context1);
   * // will remove `event1` and `event2` but `event3` will be still there
   *
   * @example <caption>By combination</caption>
   * emitter.off('event', callback);
   * // removes all `event` with registered `callback`
   *
   * @example <caption>With event hash</caption>
   * emitter.off({ event1: callback1, event2: [callback2, context2] });
   * // will remove all `event1` with callback `callback1` and all `event2` with callback `callback2` and context `context2`
   *
   * @example <caption>With event hash and default callback and context</caption>
   * // Default callback and context works exactly like in other methods
   * emitter.off({ event1: callback1, event2: [callback2, context2] }, defaultCallback, defaultContext );
   * // will remove:
   * // 1) all `event1` with callback `callback1` and context `defaultContext`
   * // 2) all `event2` with callback `callback2` and context `context2`
   *
   * @param {(string|function|object)} [event] - event name, callback or events hash
   * @param {(callback|object)} [callback] - callback or context
   * @param {object} [context] - context
   * @returns {*} this, chainable
   */
  off(event, callback, context) {
    let argsContext = {
      type: 'remove',
      methodArgs: [event, callback, context],
      emiter: this,
      default: [{ emiter: this }]
    };
    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.removeEvents(eventsContexts);

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
   * listener.stopListening('event1');
   * // will remove all `event1`
   *
   * @example <caption>With events hash and specified emitter</caption>
   * listener.stopListening(emiter, {
   *   event1: callback,
   *   event2: [callback2, context],
   *   event3: null
   * });
   * // will remove
   * // 1) event1 with callback
   * // 2) event2 with callback2 and context
   * // 3) event3
   *
   * @example <caption>With events hash and not specified emitter</caption>
   * listener.stopListening(null, {
   *   event1: callback,
   *   event2: [callback2, context],
   *   event3: null
   * });
   * // will remove
   * // 1) event1 with callback for all emitters
   * // 2) event2 with callback2 and context for all emitters
   * // 3) event3 for all emitters
   *
   * @param {object} [emitter]
   * @param {(string|function|object)} [event] - event name, callback or events hash
   * @param {(callback|object)} [callback] - callback or context
   * @param {object} [context] - context
   * @returns {*} this, chainable
   */
  stopListening(emitter, event, callback, context) {
    let argsContext = {
      type: 'remove',
      methodArgs: [emitter, event, callback, context],
      listener: this,
      default: [{ listener: this }]
    };

    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.removeEvents(eventsContexts);

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
   *  event3: undefined
   * }, 'foo')
   * // will trigger `event1` with `bar`
   * // event2 without arguments
   * // event3 with `foo`
   *
   * @param {(string|object)} event - event names or event hash
   * @param {...*} [args] - arguments to be passed
   * @returns {*} this, chainable
   */
  trigger(event, ...args) {
    let argsContext = {
      type: 'trigger',
      methodArgs: [event, ...args],
      emiter: this
    };

    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.triggerEvents(eventsContexts, false);

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
   * @param {...*} [args] - arguments to be passed
   * @returns {*} last (in case of multiple events) result of invoked method
   */
  triggerMethod(event, ...args) {
    let argsContext = {
      type: 'trigger',
      methodArgs: [event, ...args],
      emiter: this
    };
    let eventsContexts = prepareApiArguments(argsContext);
    EventsHandler.triggerEvents(eventsContexts, true);
  },

  /**
   * Will returns emitter's own method for given eventName.
   * Internally used by `triggerMethod`, feel free to override
   * @example <caption>override to respect emitter's `options`</caption>
   * emitter.getOnMethod = function(eventName, methodName) {
   *  if (typeof this.options[methodName] == 'function') {
   *    return this.options[methodName]; //no need to bind, it will be called with emitter as context
   *  }
   *  return typeof this[methodName] == 'function' && this[methodName];
   * }
   * @param {string} eventName - triggered event name
   * @param {string} methodName - suggested method name: for `event:one` it will be `onEventOne`
   * @returns {(function|falsy)}
   */
  getOnMethod(eventName, methodName) {
    return typeof this[methodName] == 'function' && this[methodName];
  }
};

export { Events, setInterop };
