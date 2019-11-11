import {
  isObj, isFunc, eventNameToMethodName,
  handlerSymbol,
  eventNameSplitter,
  emptyArray
} from './utils';

import { Callback } from './Callback';

let idcounter = 0;

const cloneArray = Array.prototype.slice;

export class EventsHandler {

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
      Object.keys(event).forEach(eventNames => this.removeStringEvents(eventNames, event[eventNames], context))
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
export function handler(instance, dontCreate) {
  let h = instance[handlerSymbol];
  if (!dontCreate && !h) {
    h = instance[handlerSymbol] = new EventsHandler(instance);
  }
  return h;
}

/**
 * Shows if there is an EventsHandler under the hood
 *
 * @export
 * @param {*} instance - any eventable object
 * @returns {boolean} - true if EventsHandler already created
 */
export function hasHandler(instance) {
  return instance[handlerSymbol] instanceof EventsHandler;
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
