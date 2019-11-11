import { isFunc } from './utils';

export const interops = new Map();

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
 * @param {Class} type - interop type
 * @param {interop} interop - interop handler
 * @return {void}
 */
export function setInterop(type, interop) {
  if (interop === null) {
    interops.delete(type);
  } else {
    interops.set(type, interop);
  }
}
