import { prepareApiArguments, eventsMixinSymbol } from './utils';
import { EventsHandler as privateApi } from './EventsHandler';
let gcounter = 0;
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
    privateApi.addEvents(eventsContexts);
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
    privateApi.addEvents(eventsContexts);
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
    privateApi.addEvents(eventsContexts);
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
    privateApi.addEvents(eventsContexts);

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
    privateApi.removeEvents(eventsContexts);

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
    privateApi.removeEvents(eventsContexts);

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
    privateApi.triggerEvents(eventsContexts, false);

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
    privateApi.triggerEvents(eventsContexts, true);
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
export default Events;
