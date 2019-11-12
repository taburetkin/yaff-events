import { Instance } from '../tests-helpers';
import { setInterop, interops, getInterop } from '../../interop';
//import { getStats } from '../../EventsHandler';
import { Model } from 'backbone';
import EventEmitter from 'events';


const interopMixin = {
  emit(name, ...args) {
    let cbs = this.events.get(name);
    if (!cbs) return;
    Array.from(cbs).forEach(cb => cb(...args));
  },
  addEvent(name, cb) {
    let eventCbs = this.events.get(name) || new Set();
    eventCbs.add(cb);
    this.events.set(name, eventCbs);
  },
  removeEvent(name, cb) {
    if (name) {
      this._removeEventCb(name, cb);
      return;
    }
    for (let eventName of this.events.keys()) {
      this._removeEventCb(eventName, cb);
    }
  },
  _removeEventCb(name, cb) {
    let cbs = this.events.get(name);
    if (!cbs) return;
    if (cb) {
      cbs.delete(cb);
      return;
    }
    Array.from(cbs).forEach(_cb => cbs.delete(_cb));
  }
}
const interopConfig = {
  on(emitter, listener, eventName, callback) {
    emitter.addEvent(eventName, callback);
  },
  off(emitter, listener, eventName, callback) {
    emitter.removeEvent(eventName, callback);
  }
}
class BaseType {
  constructor() {
    this.events = new Map();
  }
}
class DerivedType extends BaseType { }

Object.assign(BaseType.prototype, interopMixin);


describe('interop', () => {
  let listener;
  let cb1;
  let spy;
  let spy2;
  let emitter;

  beforeEach(function () {
    cb1 = () => { };
    listener = new Instance();
  });

  describe('default interop', () => {
    describe('when interop does not support `on`', function () {
      it('should throw', function () {
        let emiter = {};
        expect(listener.listenTo.bind(listener, emiter, 'event', cb1)).to.throw();
      });
    });
  });

  describe('setInterop', () => {
    let baseCustom;
    beforeEach(() => {
      baseCustom = new BaseType();
      spy = sinon.spy();
      spy2 = sinon.spy();
      interops.clear();
    });
    it('should not throw when provided correct type', () => {
      setInterop(BaseType, interopConfig);

      expect(listener.listenTo.bind(listener, baseCustom, 'test', spy)).to.not.throw()

    });
    it('should throw after clearing interop', () => {
      setInterop(BaseType, interopConfig);

      expect(listener.listenTo.bind(listener, baseCustom, 'test', spy)).to.not.throw();

      setInterop(BaseType, null);
      expect(listener.listenTo.bind(listener, baseCustom, 'test', spy)).to.throw();

    });
    it('should not throw after replacing type\'s interop', () => {

      setInterop(BaseType, interopConfig);

      expect(listener.listenTo.bind(listener, baseCustom, 'test', spy), 'listenTo #1').to.not.throw();

      baseCustom.emit('test', 1, 2, 3);
      expect(spy, 'spy #1').to.be.calledOnce.and.calledWith(1, 2, 3);

      setInterop(BaseType, { on: () => { }, off: () => { } });
      expect(listener.listenTo.bind(listener, baseCustom, 'shmest', spy2), 'listenTo #2').to.not.throw();
      baseCustom.emit('shmest', 1, 2, 3);

      expect(spy2, 'spy #2').to.not.been.called;
    });
  });

  describe('listening not yaff', () => {
    let emitter;
    before(() => {
      setInterop(DerivedType, interopConfig);
    });
    beforeEach(() => {
      emitter = new DerivedType();
      spy = sinon.spy();
      spy2 = sinon.spy();
    });
    it('should invoke callbacks', () => {
      listener.listenTo(emitter, { a: spy, b: spy2 });
      emitter.emit('a', 'foo', 'bar');
      emitter.emit('b', 'alpha', 'bravo');
      expect(spy, 'spy #1').to.be.calledOnce.and.calledWith('foo', 'bar');
      expect(spy2, 'spy #2').to.be.calledOnce.and.calledWith('alpha', 'bravo');
      emitter.emit('b');
      expect(spy2, 'spy #2').to.be.calledTwice;
    });
    it('should correctly handle once', function () {
      listener.listenToOnce(emitter, 'a', spy);
      listener.listenTo(emitter, 'b', spy2);
      emitter.emit('a');
      emitter.emit('a');
      emitter.emit('b');
      emitter.emit('b');
      expect(spy, 'spy #1').to.be.calledOnce;
      expect(spy2, 'spy #2').to.be.calledTwice;
    });
    it('should correctly stop listening', () => {
      listener.listenToOnce(emitter, 'a', spy);
      listener.listenTo(emitter, 'b', spy2);
      listener.stopListening(emitter);
      emitter.emit('a');
      emitter.emit('b');
      listener.listenTo(emitter, 'a b', spy2);
      listener.stopListening();
      expect(emitter.events.get('a').size, 'a').to.be.equal(0);
      expect(emitter.events.get('b').size, 'b').to.be.equal(0);
      expect(spy, 'spy #1').to.not.been.called;
      expect(spy2, 'spy #2').to.not.been.called;
    });
  });

  describe('listening backbone', () => {
    beforeEach(() => {
      emitter = new Model();
      spy = sinon.spy();
      spy2 = sinon.spy();
    });
    it('should invoke callbacks', () => {
      listener.listenTo(emitter, { a: spy, b: spy2 });
      emitter.trigger('a', 'foo', 'bar');
      emitter.trigger('b', 'alpha', 'bravo');
      expect(spy, 'spy #1').to.be.calledOnce.and.calledWith('foo', 'bar');
      expect(spy2, 'spy #2').to.be.calledOnce.and.calledWith('alpha', 'bravo');
      emitter.trigger('b');
      expect(spy2, 'spy #2').to.be.calledTwice;
    });
    it('should correctly handle once', function () {
      listener.listenToOnce(emitter, 'a', spy);
      listener.listenTo(emitter, 'b', spy2);
      emitter.trigger('a');
      emitter.trigger('a');
      emitter.trigger('b');
      emitter.trigger('b');
      expect(spy, 'spy #1').to.be.calledOnce;
      expect(spy2, 'spy #2').to.be.calledTwice;
    });
    it('should correctly stop listening', () => {
      listener.listenToOnce(emitter, 'a', spy);
      listener.listenTo(emitter, 'b', spy2);
      listener.stopListening(emitter);
      emitter.trigger('a');
      emitter.trigger('b');
      expect(spy, 'spy #1').to.not.been.called;
      expect(spy2, 'spy #2').to.not.been.called;
    });
  });

  describe('listening nodejs events', () => {
    let emitter;
    beforeEach(() => {
      emitter = new EventEmitter();
      spy = sinon.spy();
      spy2 = sinon.spy();
    });
    it('should invoke callbacks', () => {
      listener.listenTo(emitter, { a: spy, b: spy2 });
      emitter.emit('a', 'foo', 'bar');
      emitter.emit('b', 'alpha', 'bravo');
      expect(spy, 'spy #1').to.be.calledOnce.and.calledWith('foo', 'bar');
      expect(spy2, 'spy #2').to.be.calledOnce.and.calledWith('alpha', 'bravo');
      emitter.emit('b');
      expect(spy2, 'spy #2').to.be.calledTwice;
    });
    // TODO: think of all handler.
    // it.only('should handle all', () => {
    //   listener.listenTo(emitter, 'all', spy);
    //   emitter.emit('a', 'foo', 'bar');
    //   expect(spy, 'spy #1').to.be.calledOnce.and.calledWith('foo', 'bar');
    //   emitter.emit('b', 'alpha', 'bravo');
    //   expect(spy, 'spy #2').to.be.calledOnce.and.calledWith('alpha', 'bravo');
    // })
    it('should correctly handle once', function () {
      listener.listenToOnce(emitter, 'a', spy);
      listener.listenTo(emitter, 'b', spy2);
      emitter.emit('a');
      emitter.emit('a');
      emitter.emit('b');
      emitter.emit('b');
      expect(spy, 'spy #1').to.be.calledOnce;
      expect(spy2, 'spy #2').to.be.calledTwice;
    });
    it('should correctly stop listening', () => {
      listener.listenToOnce(emitter, 'a', spy);
      listener.listenTo(emitter, 'b', spy2);
      listener.stopListening(emitter);
      emitter.emit('a');
      emitter.emit('b');
      expect(spy, 'spy #1').to.not.been.called;
      expect(spy2, 'spy #2').to.not.been.called;
    });
  });

});
