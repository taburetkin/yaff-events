# yaff-events

Simple es6 events engine with interop support - DOM, nodejs, backbone and othres.  
Inspired by `backbone.js` and also backbone compatible.  
- [interop](interop.md)
- [preformance](performance.md)

## Install

with npm

```javascript
npm i yaff-events
```

with yarn

```javascript
yarn add yaff-events
```

## Reference

The API is actually the same as in Backbone.  
Anyway, the details are here -> [reference](reference.md)

## Named exports

- `Events` mixin
- `setInterop` method

## How to use

```javascript
import { Events } from 'yaff-events';

class MyClass {}
Object.assign(MyClass.prototype, Events);


const instance = new MyClass();
const another = new MyClass();

// registering event callback
instance.on('event', () => { console.log('event!') });
// triggering event
instance.trigger('event');
// console:
// event!

another.listenTo(instance, 'event', () => { console.log('once more!') })
instance.trigger('event');
// console:
// event!
// once more
```

## Events mixin

| Method            | Description                                                                          |
| ----------------- | ------------------------------------------------------------------------------------ |
| **on**            | Registers event(s) callbacks                                                         |
| **once**          | Registers event(s) callbacks which will be invoked once                              |
| **off**           | Removes registered callbacks                                                         |
| **listenTo**      | Registers event(s) callbacks for given emitter                                       |
| **listenToOnce**  | Registers event(s) callbacks for given emitter which will be invoked once            |
| **stopListening** | Removes registered callbacks for given emitter                                       |
| **trigger**       | Triggers registered event's callbacks                                                |
| **triggerMethod** | Triggers registered event's callbacks and invokes emitter's event associated methods |
| **getOnMethod**   | Returns event associated method if any. Feel free to override to provide own logic   |

## setInterop method

Use this method for defining interop behavior.
Also there is a default one which tries to use emitter's `on` and `off`.  
For more details check [reference](reference.md)
