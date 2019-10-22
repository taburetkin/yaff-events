import { newid } from './utils';
import {
  CallbackContext,
  createEventCallbackContextPredicate
} from './CallbackContext';
import { EventsHandler } from './EventsHandler';

/**
 * Represents callbackcontexts collection for named event
 * @private
 * @export
 * @class EventContext
 */
export class EventContext {
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
