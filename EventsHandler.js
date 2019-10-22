import { groupBy, isYaffEvents, eventNameToMethodName } from './utils';
import { createEventCallbackContextPredicate } from './CallbackContext';
import { EventContext } from './EventContext';
import { getFromStore } from './store';

/**
 * Represents Events handler for entity with rpovided id.
 * @private
 * @export
 * @class EventsHandler
 */
export class EventsHandler {
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
 * Gets registered events stats from EventsHandler for given object
 * For internal use only
 * @private
 * @export
 * @param {object} instance
 * @returns
 */
export function getStats(instance) {
  let handler = EventsHandler.get(instance);
  let _events = Array.from(handler.eventsContexts.values()).reduce(
    (allevents, cnt) => {
      allevents.push(...cnt.contexts.values());
      return allevents;
    },
    []
  );
  let _listenTo = Array.from(handler.listenTo.values());
  let listeners = groupBy(_events, 'listener', x => !!x);

  let listenersCount = listeners.size;
  let emiters = groupBy(_listenTo, 'emiter');
  let emitersCount = emiters.size;
  let eventsCount = _events.length;
  let result = { eventsCount, listenersCount, emitersCount };

  return result;
}
