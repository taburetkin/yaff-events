// split the event name on the ":"
const splitter = /(^|:)(\w)/gi;
// Only calc eventNameToMethodName once
const methodCache = {};
// key for events handler
export const handlerSymbol = Symbol('eventshandler');
// split string events by space
export const eventNameSplitter = /\s+/g;
// find all events predicate
//export const findAllPredicate = cb => cb && cb.eventName === 'all';

// yaff events indicator
export const eventsMixinSymbol = Symbol('yaffevents');

// unmutable fallback empty array
export const emptyArray = [];

export function isYaffEvents(arg) {
  return arg && arg._yaffevents_ == eventsMixinSymbol;
}

export function isFunc(arg) {
  return typeof arg === 'function';
}


export function isObj(arg) {
  return arg !== null && typeof arg === 'object';
}

/**
 * Converts `event:name` to `onEventName`
 * @private
 * @export
 * @param {string} event - event name
 * @returns {string} method name
 */
export function eventNameToMethodName(event) {
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
