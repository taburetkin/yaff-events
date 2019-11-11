import { Instance, getStats } from '../tests-helpers';
import { hasHandler, handler } from '../../EventsHandler';
let emitter;
let listener;
let context;
let cb1;
let cb2;
let spy;
let spy2;
let counter1 = 0;
let counter2 = 0;
let inc1 = () => counter1++;
let inc2 = () => counter2++;
describe('events mixin', () => {
  beforeEach(() => {
    context = { cnt: 1 };
    counter1 = 0;
    counter2 = 0;
    cb1 = () => { };
    emitter = new Instance();
    listener = new Instance();
  });

  describe('once', () => {
    it('should register events by hash', () => {
      emitter.once({ a: inc1, b: inc2 });
      emitter.trigger('a b a b');
      expect(counter1, 'counter1').to.be.equal(1);
      expect(counter2, 'counter2').to.be.equal(1);
    });
  });

  describe('listenTo', () => {
    describe('when mallformed arguments', () => {
      let originalCtor;
      beforeEach(() => {
      });
      it('should not set handler', () => {
        listener.listenTo();
        listener.listenTo(null);
        listener.listenTo({});
        listener.listenTo('foo');
        listener.listenTo(null, {});
        listener.listenTo(emitter);
        listener.listenTo(emitter, null);
        listener.listenTo(emitter, 'asd');
        expect(hasHandler(listener)).to.be.false;
      });
    });
    describe('with events hash', () => {
      describe('when callback is actually a context', () => {
        it('should bind events with provided context', () => {
          listener.listenTo(emitter, {
            a: function () { this == context && inc1() }
          }, context);
          emitter.trigger('a');
          expect(counter1).to.be.equal(1);
        });
      });
    });

  });

  describe('listenToOnce', () => {
    describe('when mallformed arguments', () => {
      it('should not set handler', () => {
        listener.listenToOnce();
        listener.listenToOnce(null);
        listener.listenToOnce({});
        listener.listenToOnce('foo');
        listener.listenToOnce(null, {});
        listener.listenToOnce(emitter);
        listener.listenToOnce(emitter, null);
        listener.listenToOnce(emitter, 'asd');
        expect(hasHandler(listener)).to.be.false;
      });
    });
    describe('with events hash', () => {
      describe('when callback is actually a context', () => {
        it('should bind events with provided context', () => {
          listener.listenToOnce(emitter, {
            a: function () { this == context && inc1() }
          }, context);
          emitter.trigger('a');
          expect(counter1).to.be.equal(1);
        });
      });
    });
  });

  describe('trigger', () => {
    describe('when called with wrong arguments', () => {
      let ehandler;
      beforeEach(() => {
        ehandler = handler(emitter);
        spy = sinon.spy(ehandler, 'triggerString');
        spy2 = sinon.spy(ehandler, 'triggerHash');
      });
      it('should not invoke api methods', () => {
        emitter.trigger('');
        emitter.trigger(123123);
        emitter.trigger(null);
        emitter.trigger(void 0);
        emitter.trigger();
        expect(spy).to.not.be.called;
        expect(spy2).to.not.be.called;
      });
    });
  });

  describe('triggerMethod', () => {
    describe('when called with wrong arguments', () => {
      let ehandler;
      beforeEach(() => {
        ehandler = handler(emitter);
        spy = sinon.spy(ehandler, 'triggerString');
        spy2 = sinon.spy(ehandler, 'triggerHash');
      });
      it('should not invoke api methods', () => {
        emitter.triggerMethod('');
        emitter.triggerMethod(123123);
        emitter.triggerMethod(null);
        emitter.triggerMethod(void 0);
        emitter.triggerMethod();
        expect(spy).to.not.be.called;
        expect(spy2).to.not.be.called;
      });
    });
    describe('when called with events hash', () => {
      beforeEach(() => {
        cb1 = sinon.spy(() => 'foo');
        cb2 = sinon.spy(() => 'bar');
      });
      it('should invokes all methods but return result of last one', () => {
        emitter.onEvent = cb1;
        emitter.onEvent2 = cb2;
        let result = emitter.triggerMethod({ event: [1, 2, 3], event2: null });
        expect(cb1).to.be.calledOnce;
        expect(cb2).to.be.calledOnce;
        expect(result).to.be.equal('bar');
      });
      it('should invoke method with correct arguments', () => {
        emitter.onEvent = cb1;
        let result = emitter.triggerMethod({ event: [1, 2, 3] });
        expect(cb1).to.be.calledOnce.and.calledWith(1, 2, 3);
        expect(result).to.be.equal('foo');
      });
    });
    describe('when called with string event', () => {
      beforeEach(() => {
        cb1 = emitter.onEvent1 = sinon.spy(() => 'foo');
        cb2 = emitter.onEvent2 = sinon.spy(() => 'bar');
      });
      afterEach(() => {
        delete emitter.onEvent1;
        delete emitter.onEvent2;
      });
      it('should invoke method even if there is no any events', () => {
        emitter.triggerMethod('event1', 1, 2, 3);
        expect(cb1).to.be.calledOnce.and.calledWith(1, 2, 3);
        let result = emitter.triggerMethod('event1 event2', 3, 2, 1);
        expect(cb1).to.be.calledTwice;
        expect(cb2).to.be.calledOnce.and.calledWith(3, 2, 1);
        expect(result).to.be.equal('bar');
      });
      it('should be able to trigger method without any arguments', () => {
        let res = emitter.triggerMethod('event2');
        expect(cb2).to.be.calledOnce.and.calledWith();
        expect(res).to.be.equal('bar');
      });
      it('should not throw if there si no events and methods', () => {
        expect(emitter.triggerMethod.bind(emitter, 'qwerty')).to.not.throw();
      });
    });
  });

  describe('off', () => {
    const counters = {};

    const createCounter = (key, context) => function () {
      !counters[key] && (counters[key] = 0);
      if (context && this != context) {
        return;
      }
      counters[key]++;
    }

    describe('when only callback was provided', () => {
      it('should remove all events with provided callback', () => {
        let cb1 = () => inc1();
        let cb2 = () => inc1();
        emitter.on('a b c', cb1);
        emitter.on('b', cb2);
        emitter.off(null, cb1);
        emitter.trigger('a b c');
        expect(counter1).to.be.equal(1);
      });
    });
    describe('with events hash', () => {
      beforeEach(() => {
        emitter.on('a', createCounter('a'));
        emitter.on('b c', createCounter('bc', context), context);
      });
      it('should remove all meeted events with provided context', () => {

        emitter.off({
          a: null,
          b: () => { },
          c: null
        }, context);

        emitter.trigger('a b c');

        expect(counters.a).to.be.equal(1);
        expect(counters.bc).to.be.equal(1);

      });
    });
  });

  describe('stopListening', () => {
    let counters;

    const createCounter = (key, context) => function () {
      !counters[key] && (counters[key] = 0);
      if (context && this != context) {
        return;
      }
      counters[key]++;
    }
    beforeEach(() => {
      counters = {};
      cb1 = createCounter('a');
      cb2 = createCounter('bc', context);
      listener.listenTo(emitter, 'a', cb1);
      listener.listenTo(emitter, 'b c', cb2, context);
    });
    describe('with events hash', () => {
      it('should remove all meeted events with provided context', () => {

        listener.stopListening(null, {
          a: null,
          b: () => { },
          c: null
        }, context);

        emitter.trigger('a b c');
        expect(counters.a, 'a with context').to.be.equal(1);
        expect(counters.bc, 'b,c with context').to.be.equal(1);

      });
      it('should remove all meeted events with provided callback', () => {

        listener.stopListening(null, {
          a: cb1,
          b: () => { },
          c: null
        }, cb2);

        emitter.trigger('a b c');
        expect(counters.a, 'a with context').to.be.undefined;
        expect(counters.bc, 'b,c with context').to.be.equal(1);

      });
    });
    describe('with multiple emitters', () => {
      let em1;
      let em2;
      let em3;
      beforeEach(() => {
        em1 = new Instance();
        em2 = new Instance();
        em3 = new Instance();
      });
      it('should correctly clean references', () => {
        listener.listenTo(em1, 'foo bar baz', () => { });
        listener.listenTo(em2, 'qwe asd zxc', () => { });
        listener.listenTo(em3, '123 456 789', () => { });
        listener.stopListening(em2);
        em3.off();
        listener.listenTo(em2, 'test', () => { });
        listener.stopListening(null, 'abra-kadabra');
        listener.stopListening();

        let ls = getStats(listener);
        let es1 = getStats(em1);
        let es2 = getStats(em2);
        let es3 = getStats(em3);
        expect(ls.eventsCount + ls.emitersCount + ls.listenersCount, 'listener').to.be.equal(0);
        expect(es1.eventsCount + es1.emitersCount + es1.listenersCount, 'em1').to.be.equal(0);
        expect(es2.eventsCount + es2.emitersCount + es2.listenersCount, 'em2').to.be.equal(0);
        expect(es3.eventsCount + es3.emitersCount + es3.listenersCount, 'em3').to.be.equal(0);
      });
    });
  });

});
