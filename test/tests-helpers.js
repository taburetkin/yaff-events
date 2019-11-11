//import { Events } from '../index';
import { Events as mixin } from '..';
import { handler } from '../EventsHandler';
export const Instance = function (type) {
  this.type = type;
};
Instance.prototype = Object.assign({}, mixin);

export const delay = n => {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  });
};
export const debounce = function (func, wait, immediate) {
  let timeout;
  let result;

  let later = function (context, args) {
    timeout = null;
    if (args) result = func.apply(context, args);
  };

  let debounced = function (...args) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      let callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(this, args);
        console.log('called immediate');
      }
    } else {
      timeout = setTimeout(() => later(this, args), wait);
      //_.delay(later, wait, this, args);
    }

    return result;
  };

  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
};

export function getStats(_obj) {
  let obj = handler(_obj);
  let eventsCount = 0;
  let emitters = new Set();
  let listeners = new Set();
  /*
  obj.flatEvents.forEach(cb => {
    if (cb == null) return;

    eventsCount++;
    cb.listener && listeners.add(cb.listener)
  });
  obj.flatListenTos.forEach(cb => {
    if (cb == null) return;
    cb.emitter && emitters.add(cb.emitter);
  });
  */

  obj.events.forEachEvent(cb => {
    if (!cb || cb._destroyed) return;
    eventsCount++;
    cb.listener && listeners.add(cb.listener);
  });
  obj.listenTos.forEachEvent(cb => {
    cb && cb.listener && emitters.add(cb.listener)
  });
  return {
    eventsCount,
    emitersCount: emitters.size, //Object.keys(this.listenTos).reduce((sum, key) => sum + this.listenTos[key].length, 0),
    listenersCount: listeners.size
  }
}
