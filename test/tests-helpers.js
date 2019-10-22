//import { Events } from '../index';
import { Events as mixin } from '..';
export const Instance = function(type) {
  this.type = type;
};
Instance.prototype = Object.assign({}, mixin);

export const delay = n => {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  });
};
export const debounce = function(func, wait, immediate) {
  let timeout;
  let result;

  let later = function(context, args) {
    timeout = null;
    if (args) result = func.apply(context, args);
  };

  let debounced = function(...args) {
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

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
};
