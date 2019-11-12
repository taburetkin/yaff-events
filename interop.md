# Interop examples
yaff-events shipped with possibility to setup interop for other events engines like nodejs events or DOM events.  
Lets see how to do that.

## DOM
1. Let's create our listener
```javascript
const listener = { ...yaffEvents.Events };
```

2. Now its time to define interop rule for DOM events
```javascript
import { setInterop } from 'yaff-events';

setInterop(Element, {
	on(emitter, listener, eventName, callback) {
		emitter.addEventListener(eventName, callback);
	},
	off(emitter, listener, eventName, callback) {
		emitter.removeEventListener(eventName, callback);
	}
});

```
3. We need a DOM element, let's create one
```javascript
const el = document.createElement('div');
el.innerHTML = 'click me';
document.body.appendChild(el);
el.style="width:200px;height:75px;background-color:#00000020";
```

4. Finally, we are ready to set up event handler
```javascript
listener.listenToOnce(el, 'click', function(...args){ 
	console.log('CLICK', args, this);
});
```

## NODEJS
The thing is that nodejs Events uses `on` and `off` and that is default interop. So, we even dont have to do anything.

```javascript
//nodejs environment
import EventEmitter from 'events';
import { Events } from 'yaff-event';

const listener = { ...yaffEvents.Events };
const emitter = new EventEmitter();

listener.listenTo(emitter, 'event', console.log);
emitter.emit('event', 'foo', 'bar');

// out: foo, bar

```

## Backbone.Events
You can replace backbone Events with yaff-events and everything will work, or just use it as is because of default interop. 
