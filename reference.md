## Mixins

<dl>
<dt><a href="#Events">Events</a></dt>
<dd><p>Events mixin. Just mix it into your prototypes</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#setInterop">setInterop(type, interop)</a> ⇒ <code>void</code></dt>
<dd><p>Registers interop for given type.
There is a default interop which tries to use <code>on</code> and <code>off</code>
It will be applied if there is no any suitable registered interop</p>
</dd>
</dl>

<a name="Events"></a>

## Events
Events mixin. Just mix it into your prototypes

**Kind**: global mixin  

* [Events](#Events)
    * [.on(event, [callback], [context])](#Events.on) ⇒ <code>\*</code>
    * [.once(event, [callback], [context])](#Events.once) ⇒ <code>\*</code>
    * [.listenTo(emitter, event, [callback], [context])](#Events.listenTo) ⇒ <code>\*</code>
    * [.listenToOnce(emitter, event, [callback], [context])](#Events.listenToOnce) ⇒ <code>\*</code>
    * [.off([event], [callback], [context])](#Events.off) ⇒ <code>\*</code>
    * [.stopListening([emitter], [event], [callback], [context])](#Events.stopListening) ⇒ <code>\*</code>
    * [.trigger(event, [...args])](#Events.trigger) ⇒ <code>\*</code>
    * [.triggerMethod(event, [...args])](#Events.triggerMethod) ⇒ <code>\*</code>
    * [.getOnMethod(eventName, methodName)](#Events.getOnMethod) ⇒ <code>function</code> \| <code>falsy</code>

<a name="Events.on"></a>

### Events.on(event, [callback], [context]) ⇒ <code>\*</code>
Registers event(s) with given callback

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - this, chainable  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> \| <code>object</code> | event name(s) or events hash |
| [callback] | <code>function</code> \| <code>object</code> | optional if event is events hash |
| [context] | <code>object</code> | event callback context |

**Example** *(single event with default context)*  
```js
let callback = function() { }
instance.on('some:event', callback);
```
**Example** *(single event with provided context)*  
```js
let callback = function() { }
let context = { some: 'context'};
instance.on('some:event', callback, context)
// `this` will be equal to `context`
```
**Example** *(multiple events with single callback)*  
```js
let callback = function() { }
instance.on('event1 event2', callback);
// will registers both `event1` and `event2` with `callback` and instance as context
```
**Example** *(multiple events by hash with default context)*  
```js
instance.on({
  event1: callback1,
  event2: callback2
});
// will registers `event1` with callback1 and `event2` with callback2 and instance as context for both
```
<a name="Events.once"></a>

### Events.once(event, [callback], [context]) ⇒ <code>\*</code>
Registers event(s) with given callback which will be invoked only once

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - this, chainable  
**See**: Events.on  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> \| <code>object</code> | event(s) name or events hash |
| [callback] | <code>function</code> \| <code>object</code> | optional if event is events hash |
| [context] | <code>object</code> | event callback context |

<a name="Events.listenTo"></a>

### Events.listenTo(emitter, event, [callback], [context]) ⇒ <code>\*</code>
Registers event(s) callback(s) which should happens on given instance.Just like `on` but first argument is an object which will trigger the event.

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - this, chainable  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>object</code> | instance you want to listen |
| event | <code>string</code> \| <code>object</code> | event(s) name or events hash |
| [callback] | <code>function</code> \| <code>object</code> | callback if events is a string or optional context if events is a hash |
| [context] | <code>object</code> | default event callback context if event is a string |

**Example**  
```js
listener.listenTo(emitter, 'event', callback);listener.listenTo(emitter, 'event1 event2', callback, context);listener.listenTo(emitter, { event1: callback1, event2: callback2 });listener.listenTo(emitter, { event1: callback2, event2: context2 }, context);
```
<a name="Events.listenToOnce"></a>

### Events.listenToOnce(emitter, event, [callback], [context]) ⇒ <code>\*</code>
Registers event(s) callback(s) which should happens on given instance only once.Just like `once` but first argument is an object which will trigger the event.

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - this, chainable  
**See**: Events.listenTo  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>object</code> | instance you want to listen |
| event | <code>string</code> \| <code>object</code> | event(s) name or events hash |
| [callback] | <code>function</code> \| <code>object</code> | callback if events is a string or optional context if events is a hash |
| [context] | <code>object</code> | event callback context if event is a string |

<a name="Events.off"></a>

### Events.off([event], [callback], [context]) ⇒ <code>\*</code>
Will removes all registered events by given arguments.Note that if some other instance listens for events on this object then those events will be unregistered too.

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - this, chainable  

| Param | Type | Description |
| --- | --- | --- |
| [event] | <code>string</code> \| <code>object</code> | event name(s) or events hash |
| [callback] | <code>function</code> | callback |
| [context] | <code>object</code> | callback context |

**Example** *(Without arguments)*  
```js
emitter.off();
// will remove all regsitered events
```
**Example** *(By event name)*  
```js
emitter.on('this:event that:event', callback);
emitter.off('that:event');
// will remove `that:event` but `this:event` will be still there
// also multiple events woorks too:
emitter.off('that:event this:event');
```
**Example** *(By callback)*  
```js
emitter.on({
  event1: callback1,
  event2: callback2,
  event3: callback2,
});
emitter.off(null, callback2);
// will remove `event2` and `event3` but `event1` will be still there
```
**Example** *(By combination)*  
```js
emitter.off('event', callback);
// removes all `event` with registered `callback`
```
**Example** *(With event hash)*  
```js
emitter.off({ event1: callback1, event2: null });
// will remove all `event1` with callback `callback1` and all `event2`
```
**Example** *(With event hash and context)*  
```js
emitter.off({ event1: callback1, event2: null }, callbackContext);
// will remove:
// 1) all `event1` with callback `callback1` and context `callbackContext`
// 2) all `event2` with any callback and context `callbackContext`
```
**Example** *(With just context)*  
```js
emitter.on('event1 event2', callback1, context);
emitter.on('event3', callback1);
emitter.off(null, null, context);
// will remove event1 and event2
```
<a name="Events.stopListening"></a>

### Events.stopListening([emitter], [event], [callback], [context]) ⇒ <code>\*</code>
Removes listening events by given arguments.If no arguments was passed, then removes all registered `listenTo` events

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - this, chainable  

| Param | Type | Description |
| --- | --- | --- |
| [emitter] | <code>object</code> | emitter instance |
| [event] | <code>string</code> \| <code>object</code> | event name or events hash |
| [callback] | <code>callback</code> \| <code>object</code> | callback in case its a string event and context if its an events hash |
| [context] | <code>object</code> | context in case it's a string event |

**Example**  
```js
listener.listenTo(emitter, 'event', callback1);listener.listenTo(anotherEmitter, 'another:event', callback2);listener.stopListening();// will removes both
```
**Example** *(Remove all for given emitter)*  
```js
listener.listenTo(emitter, 'event1', callback1);
listener.listenTo(emitter, 'event2', callback2);
listener.listenTo(anotherEmitter, 'event1', callback2);
listener.stopListening(emitter);
// will remove events registered on emitter
```
**Example** *(when emitter not specified)*  
```js
listener.listenTo(emitter, 'event1', callback1);
listener.listenTo(emitter, 'event2', callback2);
listener.listenTo(anotherEmitter, 'event1', callback2);
listener.stopListening(null, 'event1');
// will remove all `event1`
```
**Example** *(With events hash and specified emitter)*  
```js
listener.stopListening(emitter, {
  event1: callback,
  event2: null,
});
// will remove
// 1) event1 with callback for emitter
// 2) all event2 for emitter
```
**Example** *(With events hash and not specified emitter)*  
```js
listener.stopListening(null, {
  event1: callback,
  event3: null
});
// will remove
// 1) event1 with callback for all emitters
// 2) all event2 for all emitters
```
<a name="Events.trigger"></a>

### Events.trigger(event, [...args]) ⇒ <code>\*</code>
Trigger callbacks for the given events

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - this, chainable  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> \| <code>object</code> | event names or event hash |
| [...args] | <code>\*</code> | arguments to be passed, if event is a string |

**Example**  
```js
emitter.on('event', (...args) => console.log(args));emitter.trigger('event', 1,2,3);// will triggers registered callback// console output: [1,2,3]
```
**Example** *(multiple events with same arguments)*  
```js
emitter.trigger('event1 event2', 1,2,3);
// will trigger event1 and event2 callbacks with given arguments
```
**Example** *(multiple events with different arguments)*  
```js
emitter.trigger({
 event1: ['bar'],
 event2: null,
})
// will trigger `event1` with `bar`
// and event2 without arguments
```
<a name="Events.triggerMethod"></a>

### Events.triggerMethod(event, [...args]) ⇒ <code>\*</code>
Same as `trigger` but also in first will try to invoke instance method(s) associated with eventName.by default its a camel cased event name with prefix `on`,but you can override this behavior with providing your own version of `getOnMethod`

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>\*</code> - last (in case of multiple events) result of invoked method  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> \| <code>object</code> | event names or event hash |
| [...args] | <code>\*</code> | arguments to be passed if event is a string |

**Example**  
```js
emitter.triggerMethod('event:one');//in first will tries to invoke emitter.onEventOne method and returns its resultemitter.on({ event1: callback1, event2: callback2,})emitter.triggerMethod('event1 event1');//execution order will be// 1) emitter.onEvent1// 2) callback1// 3) emitter.onEvent2// 4) callback2// will return the result of `onEvent2`
```
<a name="Events.getOnMethod"></a>

### Events.getOnMethod(eventName, methodName) ⇒ <code>function</code> \| <code>falsy</code>
Will returns emitter's own method for given eventName.Internally used by `triggerMethod`, feel free to override

**Kind**: static method of [<code>Events</code>](#Events)  
**Returns**: <code>function</code> \| <code>falsy</code> - - returns method for `triggerMethod`  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | triggered event name |
| methodName | <code>string</code> | suggested method name: for `event:one` it will be `onEventOne` |

**Example** *(override to respect emitter&#x27;s &#x60;options&#x60;)*  
```js
emitter.getOnMethod = function(eventName, methodName) {
 if (typeof this.options[methodName] === 'function') {
   return this.options[methodName]; //no need to bind, it will be called with emitter as context
 }
 return typeof this[methodName] === 'function' && this[methodName];
}
```
<a name="setInterop"></a>

## setInterop(type, interop) ⇒ <code>void</code>
Registers interop for given type.There is a default interop which tries to use `on` and `off`It will be applied if there is no any suitable registered interop

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>Class</code> | interop type |
| interop | <code>interop</code> | interop handler |

**Example**  
```js
// registering interop for Backbone's ModelsetInterop(Backbone.Model, { on(emitter, listener, eventName, callback) {   emitter.on(eventName, callback, listener); }, off(emiter, listener, eventName, callback) {   emitter.off(eventName, callback, listener); }});
```
