import { newid, isFunc } from './utils';

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
export function getInterop(instance) {
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
export function setInterop(type, interop) {
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
export function getObjectId(obj, prefix) {
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
export function getFromStore(instance, createFn) {
  let instanceId = getObjectId(instance);
  let handler = eventsHandlers.get(instanceId);
  if (!handler) {
    handler = createFn(instanceId);
    eventsHandlers.set(instanceId, handler);
  }
  return handler;
}
