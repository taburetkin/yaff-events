
import { handler } from './EventsHandler';
import { isObj, eventsMixinSymbol, emptyArray } from './utils';

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
export default Events;
