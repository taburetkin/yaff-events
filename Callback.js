import { isYaffEvents } from './utils';
import { getInterop } from './interop';
import { handler } from './EventsHandler';
let gccounter = 0;
export class Callback {
  constructor(eventName, callback, context, once, listener, eHandler, lHandler) {
    this.id = ++gccounter;
    this.eventName = eventName
    this.callback = callback
    this.context = context
    this.once = once;
    this.listener = listener;
    //this.eHandler = eHandler;
    this.emitter = eHandler.obj;
    this.defaultContext = listener || this.emitter;

    if (this.listener) {
      this.lHandler = lHandler || handler(this.listener);
      this._listen = this.lHandler.listenTos.push(eHandler);

      if (!isYaffEvents(this.emitter)) {
        let interop = getInterop(this.emitter);
        let interopCallback = (...args) => this.invoke(args);
        interop.on(this.emitter, this.listener, this.eventName, interopCallback);
        this.removeInterop = () => {
          delete this.removeInterop;
          interop.off(this.emitter, this.listener, this.eventName, interopCallback);
        }
      }
    }
  }
  invoke(args) {
    if (this.calledOnce) return this;
    if (this.once) {
      this.calledOnce = true;
      this.destroy();
    }
    this.callback && this.callback.apply(this.context || this.defaultContext, args);
    return this;
  }
  destroy() {

    this.removeInterop && this.removeInterop();
    this.removeListenTo();
    this.removeEvent();

  }
  removeListenTo() {
    if (this._listen) {
      this._listen.count--;
      if (!this._listen.count) {
        this.lHandler.listenTos.delete(this._listen);
        this._listen = null;
      }
    }
  }
  removeEvent() {
    this._event[this._eventIndex] = null;
  }
}
