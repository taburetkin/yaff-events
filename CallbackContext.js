import { newid, isYaffEvents, isFunc } from './utils';
import { getInterop } from './store';

/**
 * Represents event callback
 * @private
 * @export
 * @class CallbackContext
 */
export class CallbackContext {
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
export function createEventCallbackContextPredicate(item, keys = defaultKeys) {
  return event => isPassKeys(item, event, keys);
}
