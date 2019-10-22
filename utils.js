let ids = {
  default: 0
};

/**
 * Provides new unique id on each call
 * @private
 * @export
 * @param {*} pref
 * @returns
 */
export function newid(pref) {
  !pref && (pref = '');
  if (!ids[pref]) {
    ids[pref] = 0;
  }
  return pref + ++ids[pref];
}

/**
 * groupBy for array by given key
 * @private
 * @export
 * @param {*} arr
 * @param {*} key
 * @param {*} predicate
 * @returns
 */
export function groupBy(arr, key, predicate) {
  return arr.reduce((groups, item) => {
    let keyValue = item[key];
    if (predicate && !predicate(item[key], item)) {
      return groups;
    }
    let group = groups.get(keyValue);
    if (!group) {
      group = [];
      groups.set(keyValue, group);
    }
    group.push(item);
    return groups;
  }, new Map());
}

export function isString(arg) {
  return typeof arg == 'string' || arg instanceof String;
}

export function isFunc(arg) {
  return typeof arg == 'function';
}

export function isArr(arg) {
  return Array.isArray(arg);
}

export function isObj(arg) {
  return !isFunc(arg) && arg instanceof Object;
}

/**
 * unwraps string events to array of eventContext and spread with provided default context
 * `event1 event2` => `[{ eventName: 'event1' }, { eventName: 'event1' }]`
 * @param {*} eventNames
 * @param {*} context
 * @returns
 */
function unString(eventNames, context) {
  return eventNames.split(/\s+/g).map(eventName => ({ eventName, ...context }));
}

/**
 * unwraps key value to a correct array
 * { event: {} } => { event: [defaultCallback, {} ] }
 * { event: () => {} } => { event: [() => {}, defaultContext ] }
 * @private
 * @param {*} arg
 * @param {(function|void)} defCb
 * @param {(object|void)} defCnt
 * @returns
 */
function normalizeHashArray(arg, defCb, defCnt) {
  if (!isArr(arg)) {
    if (isFunc(arg)) {
      arg = [arg, void 0];
    } else if (isObj(arg)) {
      arg = [void 0, arg];
    } else if (arg === void 0) {
      arg = [void 0, void 0];
    } else {
      arg = [null, null];
    }
  }

  if (!arg.length) {
    arg = [void 0, void 0];
  }

  let [first = defCb, second = defCnt] = arg;
  if (isObj(first) && arg.length == 1) {
    second = first;
    first = defCb;
  }
  if (first !== null) {
    first = (isFunc(first) && first) || void 0;
  } else {
    first = void 0;
  }
  if (second !== null) {
    second = (isObj(second) && second) || void 0;
  } else {
    second = void 0;
  }
  return [first, second];
}

/**
 * unwraps given hash { event: something } to the array of eventContexts
 * @private
 * @param {object} hash
 * @param {object} defItem
 * @param {function} defCallback
 * @param {object} defContext
 * @returns
 */
function argumentsHashReducer(hash, defItem, defCallback, defContext) {
  return Object.entries(hash).reduce((contexts, [eventNames, arg]) => {
    arg = normalizeHashArray(arg, defCallback, defContext);
    let [takeCallback, takeContext] = arg;
    let item = {
      callback: takeCallback,
      context: takeContext,
      ...defItem
    };
    let arr = unString(eventNames, item);
    contexts.push(...arr);
    return contexts;
  }, []);
}

let prepareTypes = {
  add: {
    extractArgs(args, options) {
      let { takeEmiter, listener, once, defaultContext } = options;

      let emiter = (takeEmiter && args.shift()) || options.emiter;
      let eventNames;
      let callback;
      let context;
      let [first, second, third] = args;
      callback = (isFunc(second) && second) || undefined;
      context =
        (isObj(third) && third) || (isObj(second) && second) || undefined;

      if (isString(first)) {
        eventNames = first;
        return unString(eventNames, {
          callback: callback || second, // backbone test: if callback is truthy but not a function, `on` should throw an error just like jQuery
          context,
          emiter,
          listener,
          once,
          defaultContext
        });
      } else if (isObj(first)) {
        let defitem = {
          emiter,
          listener,
          once,
          defaultContext
        };
        return argumentsHashReducer(first, defitem, callback, context);
      }
    }
  },
  remove: {
    takeEmiter(args, options) {
      if (options.takeEmiter) {
        if (isObj(args[0]) || args[0] === null) {
          let emiter = args.shift();
          return (emiter !== null && emiter) || void 0;
        }
      }
      return options.emiter;
    },
    extractArgs(args, options) {
      let emiter = this.takeEmiter(args, options);

      let listener = options.listener;
      let hash;
      let eventNames;
      let callback;
      let context;
      let [first, second, third] = args;

      if (isString(first)) {
        eventNames = first;
      } else if (isFunc(first)) {
        callback = first;
      } else if (isObj(first)) {
        hash = first;
      }

      if (isFunc(second)) {
        callback = second;
      } else if (isObj(second)) {
        context = second;
      }
      if (isObj(third)) {
        context = third;
      }

      if (eventNames) {
        return unString(eventNames, { callback, context, emiter, listener });
      } else if (hash) {
        let defitem = {
          emiter,
          listener
        };
        return argumentsHashReducer(hash, defitem, callback, context);
      } else {
        return [{ eventName: undefined, callback, context, emiter, listener }];
      }
    }
  },
  trigger: {
    extractArgs(args, { emiter }) {
      let first = args.shift();
      if (!isString(first) && !isObj(first)) {
        return;
      }
      if (isString(first)) {
        return unString(first, { emiter, triggerArgs: args });
      } else {
        return Object.entries(first).reduce(
          (memo, [eventName, triggerArgs]) => {
            !isArr(triggerArgs) && (triggerArgs = args);
            let arr = unString(eventName, { emiter, triggerArgs });
            memo.push(...arr);
            return memo;
          },
          []
        );
      }
    }
  }
};

/**
 * Helper to populate eventContext array from public methods.
 * The goal to process all possible variants of invoke arguments, normalized them and pass to the private api.
 * ('event', callback) => [{ eventName: 'event', callback }]
 * @private
 * @export
 * @param {*} context
 * @returns
 */
export function prepareApiArguments(context) {
  let { type, methodArgs = [], listener } = context;

  if (!(type in prepareTypes)) {
    throw new Error('wrong prepare arguments type ' + type);
  }

  if (!methodArgs.length) {
    return type == 'remove' ? context.default : undefined;
  }

  let options = {
    takeEmiter: (type == 'add' || type == 'remove') && isObj(listener),
    ...context
  };

  return prepareTypes[type].extractArgs(methodArgs, options);
}

export const eventsMixinSymbol = Symbol('YaffEvents');

/**
 * Checks if argument supports Yaff events
 *
 * @export
 * @param {*} inst
 * @returns {boolean}
 */
export function isYaffEvents(inst) {
  return inst && eventsMixinSymbol in inst;
}

// split the event name on the ":"
const splitter = /(^|:)(\w)/gi;
// Only calc eventNameToMethodName once
const methodCache = {};

/**
 * Converts `event:name` to `onEventName`
 * @private
 * @export
 * @param {string} event
 * @returns
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
