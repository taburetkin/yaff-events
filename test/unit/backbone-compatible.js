import { Instance, debounce, delay } from '../tests-helpers';

import { getStats } from '../../EventsHandler';
import { setInterop } from '../../';

/**
 *  This set of tests borrowed and adopted to mocha from the backbone library
 *  Just to be sure that yaff/events compatible with backbone events.
 */

const events = { getStats };

let emiter;
let counter = 0;
let counter2 = 0;
let listener;
let increment = () => counter++;
let increment2 = () => counter2++;
beforeEach(function() {
  emiter = new Instance();
  counter = 0;
  counter2 = 0;
});

describe('on and trigger', function() {
  it('event handler should be called n times', function() {
    emiter.on('event', increment);
    emiter.trigger('event');
    expect(counter).to.be.equal(1);
    emiter.trigger('event');
    emiter.trigger('event');
    emiter.trigger('event');
    emiter.trigger('event');
    expect(counter).to.be.equal(5);
  });

  it('binding and triggering multiple events by string literal', function() {
    emiter.on('a b c', increment);
    emiter.trigger('a');
    expect(counter).to.be.equal(1);

    emiter.trigger('a b');
    expect(counter).to.be.equal(3);

    emiter.trigger('c');
    expect(counter).to.be.equal(4);

    emiter.off('a c');

    emiter.trigger('a b c');
    expect(counter).to.be.equal(5);
  });

  it('binding and triggering events by event maps', function() {
    emiter.on({
      a: increment,
      b: increment,
      c: increment
    });

    emiter.trigger('a');
    expect(counter).to.be.equal(1);

    emiter.trigger({ a: void 0, b: void 0 });
    expect(counter).to.be.equal(3);

    emiter.trigger('a c');
    expect(counter).to.be.equal(5);

    emiter.off({
      a: increment,
      c: increment
    });

    emiter.trigger({ a: void 0, c: void 0, b: void 0 });
    expect(counter).to.be.equal(6);
  });

  it('binding and triggering multiple events by event maps', function() {
    emiter.on({
      'a b c': increment
    });

    emiter.trigger('a');
    expect(counter).to.be.equal(1);

    emiter.trigger('a b');
    expect(counter).to.be.equal(3);

    emiter.off({
      'a b': increment
    });

    emiter.trigger({ a: void 0, c: void 0, b: void 0 });
    expect(counter).to.be.equal(4);
  });

  it('binding and trigger with event maps context', function() {
    const context = { v: 1 };
    const context2 = { v: 2 };
    const incIfSame = function() {
      this == context && increment();
    };

    emiter.on({ a: incIfSame }, context);

    emiter.trigger('a');
    expect(counter, 'just a').to.be.equal(1);

    emiter
      .off()
      .on({ a: incIfSame }, context2, context)
      .trigger('a');
    expect(counter, 'third context').to.be.equal(2);

    emiter
      .off()
      .on('a', incIfSame, context)
      .trigger('a');
    expect(counter).to.be.equal(3);
  });
});

describe('listenTo and stopListening', function() {
  beforeEach(function() {
    listener = new Instance();
  });

  describe('listening for all events', function() {
    beforeEach(function() {
      listener.listenTo(emiter, 'all', increment);
    });
    it('should be triggered by any event', function() {
      emiter.trigger('some:event');
      expect(counter).to.be.equal(1);
    });
    it('should not be triggered if stopListening called', function() {
      listener.stopListening();
      emiter.trigger('another:event');
      expect(counter).to.be.equal(0);
    });
  });
  describe('[danger zone]', function() {
    it('listenTo and stopListening with event maps', function() {
      listener.listenTo(emiter, {
        event1: increment
      });
      emiter.trigger('event1');
      expect(counter).to.be.equal(1);

      listener.listenTo(emiter, {
        event2: increment
      });
      emiter.on('event2', increment);
      emiter.trigger('something event1 event2');
      expect(counter).to.be.equal(4);

      listener.stopListening();
      emiter.trigger('event2');
      expect(counter).to.be.equal(5);
    });

    it('stopListening with omitted args', function() {
      listener.listenTo(emiter, 'event', increment);
      emiter.on('event', increment);
      listener.listenTo(emiter, 'event2', increment);
      listener.stopListening(null, { event: increment });

      emiter.trigger('event event2');
      expect(counter, 'first case').to.be.equal(2);

      emiter.off();
      listener.listenTo(emiter, 'event event2', increment);
      listener.stopListening(null, 'event');
      //listener.stopListening();
      emiter.trigger('event2');
      expect(counter, 'second case').to.be.equal(3);

      listener.stopListening();
      emiter.trigger('event event2');
      expect(counter, 'third case').to.be.equal(3);
    });

    it('listenToOnce', function() {
      listener.listenToOnce(emiter, 'event1', increment);
      emiter.trigger('event1');
      emiter.trigger('event1');
      expect(counter).to.be.equal(1);

      listener.listenToOnce(emiter, 'event1', increment);
      listener.listenTo(emiter, 'event1', increment);
      emiter.trigger('event1');
      emiter.trigger('event1');
      expect(counter).to.be.equal(4);

      listener.listenToOnce(emiter, 'all', increment);
      emiter.trigger('one');
      emiter.trigger('two');
      expect(counter).to.be.equal(5);
    });

    it('listenToOnce and stopListening', function() {
      listener.listenToOnce(emiter, 'all', increment);
      emiter.trigger('some');
      emiter.trigger('event');
      expect(counter).to.be.equal(1);

      listener.listenToOnce(emiter, 'all', increment);
      listener.listenTo(emiter, 'all', increment);
      listener.stopListening(emiter, 'all', increment);
      emiter.trigger('event');
      expect(counter).to.be.equal(1);

      listener.listenToOnce(emiter, 'all', increment);
      listener.listenTo(emiter, 'all', increment);
      listener.stopListening();
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });

    it('listenTo and stopListening with event maps', function() {
      listener.listenTo(emiter, { change: increment });
      emiter.trigger('change');
      expect(counter).to.be.equal(1);

      listener.listenTo(emiter, { change: increment });
      listener.stopListening();
      emiter.trigger('change');
      expect(counter).to.be.equal(1);

      listener.listenTo(emiter, { change: increment, inc: increment });
      emiter.trigger('change inc'); // +2
      listener.stopListening(emiter, { change: increment });
      emiter.trigger('change inc'); // +1
      expect(counter).to.be.equal(4);

      listener.stopListening(emiter, 'inc another');
      emiter.trigger('change inc'); // +0
      expect(counter).to.be.equal(4);
    });

    it('listenTo yourself', function() {
      emiter.listenTo(emiter, 'foo', increment);
      emiter.trigger('foo');
      expect(counter).to.be.equal(1);
    });

    it('listenTo yourself cleans yourself up with stopListening', function() {
      emiter.listenTo(emiter, 'foo', increment);
      emiter.trigger('foo');
      emiter.stopListening();
      emiter.trigger('foo');
      expect(counter).to.be.equal(1);
    });

    it('stopListening cleans up references', function() {
      listener.listenTo(emiter, 'foo', increment);
      emiter.on('foo', increment);
      emiter.off();

      let eStats = getStats(emiter);
      let lStats = getStats(listener);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.emitersCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.eventsCount).to.be.equal(0);
      expect(lStats.emitersCount).to.be.equal(0);
      expect(lStats.listenersCount).to.be.equal(0);

      listener.listenTo(emiter, 'foo', increment);
      listener.on('foo', increment);
      listener.stopListening();
      listener.trigger('foo');

      eStats = getStats(emiter);
      lStats = getStats(listener);

      expect(counter).to.be.equal(1);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.emitersCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.eventsCount).to.be.equal(1);
      expect(lStats.emitersCount).to.be.equal(0);
      expect(lStats.listenersCount).to.be.equal(0);
    });
    it('stopListening cleans up references from listenToOnce', function() {
      listener.listenToOnce(emiter, 'foo', increment);
      emiter.once('foo', increment);
      emiter.off();
      let eStats = events.getStats(emiter);
      let lStats = events.getStats(listener);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.emitersCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.eventsCount).to.be.equal(0);
      expect(lStats.emitersCount).to.be.equal(0);
      expect(lStats.listenersCount).to.be.equal(0);

      listener.listenToOnce(emiter, 'foo', increment);
      listener.once('foo', increment);
      listener.stopListening();
      listener.trigger('foo');
      lStats = events.getStats(listener);
      eStats = events.getStats(emiter);

      expect(counter).to.be.equal(1);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.emitersCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.eventsCount).to.be.equal(0);
      expect(lStats.emitersCount).to.be.equal(0);
      expect(lStats.listenersCount).to.be.equal(0);
    });
    it('listenTo and off cleaning up references', function() {
      let eStats;
      let lStats;

      listener.listenTo(emiter, 'foo', increment);
      emiter.off();

      eStats = events.getStats(emiter);
      lStats = events.getStats(listener);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.emitersCount).to.be.equal(0);

      listener.listenTo(emiter, 'foo', increment);
      emiter.off('foo');

      eStats = events.getStats(emiter);
      lStats = events.getStats(listener);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.emitersCount).to.be.equal(0);

      listener.listenTo(emiter, 'foo', increment);
      emiter.off(null, increment);

      eStats = events.getStats(emiter);
      lStats = events.getStats(listener);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.emitersCount).to.be.equal(0);

      listener.listenTo(emiter, 'foo', increment);
      emiter.off(null, null, listener);
      eStats = events.getStats(emiter);
      lStats = events.getStats(listener);

      expect(eStats.eventsCount).to.be.equal(0);
      expect(eStats.listenersCount).to.be.equal(0);
      expect(lStats.emitersCount).to.be.equal(0);
    });

    it('listenTo and stopListening cleaning up references', function() {
      listener.listenTo(emiter, 'all', increment);
      emiter.trigger('anything');
      listener.listenTo(emiter, 'other', increment);
      listener.stopListening(emiter, 'other');
      listener.stopListening(emiter, 'all');
      let lStats = events.getStats(listener);
      expect(counter).to.be.equal(1);
      expect(lStats.emitersCount).to.be.equal(0);
    });

    it('listenToOnce without context cleans up references after the event has fired', function() {
      listener.listenToOnce(emiter, 'all', increment);
      emiter.trigger('anything');
      let lStats = events.getStats(listener);
      expect(counter).to.be.equal(1);
      expect(lStats.emitersCount).to.be.equal(0);
    });

    it('listenToOnce with event maps cleans up references', function() {
      listener.listenToOnce(emiter, {
        one: increment,
        two: increment
      });
      emiter.trigger('one');
      expect(counter).to.be.equal(1);
      let lStats = events.getStats(listener);
      expect(lStats.emitersCount).to.be.equal(1);
    });

    it('listenToOnce with event maps binds the correct `this`', function() {
      listener.listenToOnce(emiter, {
        one() {
          this == listener && increment();
        }
      });
      emiter.trigger('one');
      expect(counter).to.be.equal(1);
    });

    it("listenTo with empty callback doesn't throw an error", function() {
      listener.listenTo(emiter, 'all', null);
      emiter.trigger('anything');
    });

    it('trigger all for each event', function() {
      let spy = sinon.spy();
      listener.listenTo(emiter, 'all', spy);
      emiter.trigger('a b c');
      expect(spy.callCount).to.be.equal(3);
      expect(spy.getCall(0).args[0]).to.be.equal('a');
      expect(spy.getCall(1).args[0]).to.be.equal('b');
      expect(spy.getCall(2).args[0]).to.be.equal('c');
    });

    it('on, then unbind all functions', function() {
      emiter.on('event', increment);
      emiter.trigger('event');
      emiter.off('event');
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });

    it('bind two callbacks, unbind only one', function() {
      emiter.on('event', increment);
      emiter.on('event', increment2);
      emiter.trigger('event');
      emiter.off('event', increment);
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
      expect(counter2).to.be.equal(2);
    });

    it('unbind a callback in the midst of it firing', function() {
      let callback = () => {
        increment();
        emiter.off();
      };
      emiter.on('event', callback);
      emiter.trigger('event');
      emiter.trigger('event');
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });

    it('two binds that unbind themeselves', function() {
      let callbackA = () => {
        increment();
        emiter.off('event', callbackA);
      };
      let callbackB = () => {
        counter2++;
        emiter.off('event', callbackB);
      };
      emiter.on('event', callbackA);
      emiter.on('event', callbackB);

      emiter.trigger('event');
      emiter.trigger('event');
      emiter.trigger('event');

      expect(counter).to.be.equal(1);
      expect(counter2).to.be.equal(1);
    });

    it('bind a callback with a default context when none supplied', function() {
      let callback = function() {
        this == emiter && increment();
      };
      emiter.once('event', callback);
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });

    it('bind a callback with a supplied context', function() {
      let callback = function() {
        this == listener && increment();
      };
      emiter.once('event', callback, listener);
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });

    it('nested trigger with unbind', function() {
      let increment3 = () => {
        increment();
        emiter.off('event', increment3);
        emiter.trigger('event');
      };
      emiter.on('event', increment3);
      emiter.on('event', increment);
      emiter.trigger('event');
    });

    it('callback list is not altered during trigger', function() {
      let switchOn = () => emiter.on('event all', increment);
      let switchOff = () => emiter.off('event all', increment);

      emiter.on('event all', switchOn).trigger('event');
      expect(counter, 'on does not alter callback list').to.be.equal(0);

      emiter
        .off()
        .on('event', switchOff)
        .on('event all', increment)
        .trigger('event');

      expect(counter, 'off does not alter callback list').to.be.equal(2);
    });

    it("#1282 - 'all' callback list is retrieved after each event.", function() {
      emiter.on('x', () => {
        emiter.on('y', increment).on('all', increment);
      });

      emiter.trigger('x y');

      expect(counter).to.be.equal(2);
    });

    it('if no callback is provided, `on` is a noop', function() {
      emiter.on('test').trigger('test');
    });

    it('if callback is truthy but not a function, `on` should throw an error just like jQuery', function() {
      expect(emiter.on.bind(emiter, 'test', 'schmest')).to.throw();
    });

    it('remove all events for a specific context', function() {
      let context = {};
      let wrongIncrement = () => {
        increment();
        increment2();
      };
      emiter.on('x y all', increment);
      emiter.on('x y all', wrongIncrement, context);
      emiter.off('x y all', null, context);
      emiter.trigger('x y');
      expect(counter).to.be.equal(4);
      expect(counter2).to.be.equal(0);
    });

    it('remove all events for a specific callback', function() {
      let wrongIncrement = () => {
        increment();
        increment2();
      };
      emiter.on('x y all', increment);
      emiter.on('x y all', wrongIncrement);
      emiter.off('x y all', wrongIncrement);
      emiter.trigger('x y');
      expect(counter).to.be.equal(4);
      expect(counter2).to.be.equal(0);
    });

    it('#1310 - off does not skip consecutive events', function() {
      emiter.on('event', increment, emiter);
      emiter.on('event', increment, emiter);
      emiter.off(null, null, emiter);
      emiter.trigger('event');
      expect(counter).to.be.equal(0);
    });
  });
  describe('once', function() {
    it('once', function() {
      emiter.on('event', increment);
      emiter.on('event', increment2);
      emiter.trigger('event');
      expect(counter)
        .to.be.equal(1)
        .and.be.equal(counter2);
    });
    it('once variant one', function() {
      emiter.once('event', increment);
      listener.on('event', increment);
      emiter.trigger('event');
      emiter.trigger('event');
      listener.trigger('event');
      listener.trigger('event');
      expect(counter).to.be.equal(3);
    });

    it('once variant two', function() {
      emiter
        .once('event', increment)
        .on('event', increment)
        .trigger('event')
        .trigger('event');

      expect(counter).to.be.equal(3);
    });

    it('once with off', function() {
      emiter.once('event', increment);
      emiter.off('event', increment);
      emiter.trigger('event');
      expect(counter).to.be.equal(0);
    });

    it('once with event maps', function() {
      emiter.once(
        {
          a: increment,
          b: increment,
          c: increment
        },
        emiter
      );
      emiter.trigger('a');
      expect(counter).to.be.equal(1);

      emiter.trigger('a b');
      expect(counter).to.be.equal(2);

      emiter.trigger('c');
      expect(counter).to.be.equal(3);

      emiter.trigger('a b c');
      expect(counter).to.be.equal(3);
    });
    it('bind a callback with a supplied context using once with emiterect notation', function() {
      let context = {};
      let callback = function() {
        this == context && increment();
      };
      emiter.once('event', callback, context);
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });
    it('once with off only by context', function() {
      let context = {};
      let context2 = {};
      emiter.once('event', increment, context);
      emiter.once('event', increment, context2);
      emiter.off(null, null, context);
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });

    it('once with asynchronous events', async function() {
      let callback = debounce(() => {
        increment();
      }, 50);
      emiter.on('async', callback);
      emiter.trigger('async');
      emiter.trigger('async');
      await delay(70);
      expect(counter).to.be.equal(1);
    });

    it('once with multiple events.', function() {
      emiter.once('x y', increment);
      emiter.trigger('x y');
      expect(counter).to.be.equal(2);
    });

    it('Off during iteration with once.', function() {
      let eventOff = function() {
        this.off('event', eventOff);
      };
      emiter.on('event', eventOff);
      emiter.once('event', () => {});
      emiter.on('event', increment);

      emiter.trigger('event');
      emiter.trigger('event');
      expect(counter).to.be.equal(2);
    });

    it('`once` with trigger should work as expected', function() {
      emiter.once('event', () => {
        increment();
        emiter.trigger('event');
      });
      emiter.trigger('event');
      expect(counter).to.be.equal(1);
    });

    it('`once` on `all` should work as expected', function() {
      emiter.off();

      emiter.once('all', () => {
        increment();
        emiter.trigger('all', 'inner');
      });

      emiter.trigger('all', 'first');

      expect(counter).to.be.equal(1);
    });

    it('once without a callback is a noop', function() {
      emiter.once('event');
      expect(emiter.trigger.bind(emiter, 'event')).to.not.throw();
    });

    it('listenToOnce without a callback is a noop', function() {
      emiter.listenToOnce(emiter, 'event');
      expect(emiter.trigger.bind(emiter, 'event')).to.not.throw();
    });

    it('event functions are chainable', function() {
      const fn = () => {};
      listener = new Instance();
      expect(emiter, '1').to.be.equal(emiter.trigger('noeventssetyet'));
      expect(emiter, '2').to.be.equal(emiter.off('noeventssetyet'));
      expect(emiter, '3').to.be.equal(emiter.stopListening('noeventssetyet'));
      // expect(emiter, '4').to.be.equal(emiter.on('a', fn));
      // expect(emiter, '5').to.be.equal(emiter.once('c', fn));
      // expect(emiter, '6').to.be.equal(emiter.trigger('a'));
      // expect(emiter, '7').to.be.equal(emiter.listenTo(listener, 'a', fn));
      // expect(emiter, '8').to.be.equal(emiter.listenToOnce(listener, 'b', fn));
      // expect(emiter, '9').to.be.equal(emiter.off('a c'));
      // expect(emiter, '10').to.be.equal(emiter.stopListening(listener, 'a'));
      // expect(emiter, '11').to.be.equal(emiter.stopListening());
    });

    it('#3448 - listenToOnce with space-separated events', function() {
      listener = new Instance();
      listener.listenToOnce(emiter, 'x y', n => n === counter++);
      emiter.trigger('x', 1);
      emiter.trigger('x', 1);
      emiter.trigger('y', 2);
      emiter.trigger('y', 2);
      expect(counter).to.be.equal(2);
    });
  });
  describe('listen to foreign instance', function() {
    const otherMixin = {
      on(name, cb) {
        !this.events && (this.events = {});
        this.events[name] = cb;
      },
      off(name) {
        !this.events && (this.events = {});
        delete this.events[name];
      },
      trigger(name, ...args) {
        !this.events && (this.events = {});
        let cb = this.events[name];
        cb && cb(...args);
      }
    };
    let other;
    beforeEach(function() {
      other = Object.assign({}, otherMixin);
    });
    it('#3611 - listenTo is compatible with non-Backbone event libraries', function() {
      emiter.listenTo(other, 'test', increment);
      other.trigger('test');
      expect(counter).to.be.equal(1);
    });
    it('#3611 - stopListening is compatible with non-Backbone event libraries', function() {
      emiter.listenTo(other, 'test', increment);
      emiter.stopListening(other);
      other.trigger('test');
      expect(counter).to.be.equal(0);
    });
    it('listenToOnce on foreign instance should invoke callback only once', function() {
      emiter.listenToOnce(other, 'test', increment);
      other.trigger('test');
      other.trigger('test');
      expect(counter).to.be.equal(1);
    });
    describe('registering interops', function() {
      class Custom {
        on(name, cb) {
          increment();
          !this.events && (this.events = {});
          this.events[name] = cb;
        }
        off(name) {
          increment2();
          !this.events && (this.events = {});
          delete this.events[name];
        }
        trigger(name, ...args) {
          !this.events && (this.events = {});
          let cb = this.events[name];
          cb && cb(...args);
        }
      }
      class DeepCustom extends Custom {}
      let interInst1;
      let interInst2;
      beforeEach(function() {
        interInst1 = new Custom();
        interInst2 = new DeepCustom();
        setInterop(Custom, {
          on: (emiter, listener, event, cb) => emiter.on(event, cb, listener),
          off: (emiter, listener, event, cb) => emiter.off(event, cb, listener)
        });
      });
      it('should use registered interop for setting the event', function() {
        listener.listenTo(interInst1, 'test', increment);
        expect(counter).to.be.equal(1);
      });
      it('should use registered interop for removing the event', function() {
        listener.listenTo(interInst1, 'test', increment);
        listener.stopListening(interInst1, 'test', increment);
        expect(counter2).to.be.equal(1);
      });
      it('should use registered interop for derived instance', function() {
        listener.listenTo(interInst2, 'test', increment);
        listener.stopListening(interInst2, 'test', increment);
        expect(counter).to.be.equal(1);
        expect(counter2).to.be.equal(1);
      });
      it('should emit event to listener', function() {
        listener.listenTo(interInst1, 'test', increment);
        interInst1.trigger('test');
        interInst1.trigger('test');
        expect(counter).to.be.equal(3);
      });
      it('should emit event to listener once', function() {
        listener.listenToOnce(interInst2, 'test', increment);
        interInst2.trigger('test');
        interInst2.trigger('test');
        expect(counter).to.be.equal(2);
      });
    });
  });
});
