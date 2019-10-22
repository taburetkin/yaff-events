import { EventsHandler } from '../../EventsHandler';
import { Instance } from '../tests-helpers';
import { prepareApiArguments } from '../../utils.js';
const api = EventsHandler;

describe("prepareApiArguments and EventsHandler's static methods", function() {
  let emiter;
  let listener;
  let context1;
  let context2;
  let spy;
  let cb1;
  let cb2;
  beforeEach(function() {
    context1 = { c: 1 };
    context2 = { c: 2 };
    emiter = new Instance('emiter');
    listener = new Instance('emiter');
    this.sinon.stub(EventsHandler.prototype, 'add');
  });
  describe('prepareApiArguments', function() {
    it('prepareApiArguments should throw if called with wrong type', function() {
      expect(prepareApiArguments.bind(null, 'wrong type')).to.throw();
    });
  });
  describe('addEvents', function() {
    beforeEach(function() {
      cb1 = () => {};
      cb2 = () => {};
      spy = this.sinon.spy(api, 'addEvents');
    });
    describe('on', function() {
      it('()', function() {
        emiter.on();
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('("event1")', function() {
        emiter.on('event1');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          }
        ]);
      });
      it('(callback)', function() {
        emiter.on(cb1);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('("event1", callback)', function() {
        emiter.on('event1', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          }
        ]);
      });
      it('("event1", callback, context)', function() {
        emiter.on('event1', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          }
        ]);
      });
      it('("event1 event2", callback)', function() {
        emiter.on('event1 event2', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          }
        ]);
      });
      it('("event1 event2", callback, context)', function() {
        emiter.on('event1 event2', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          }
        ]);
      });
      it('({ event1: undefined })', function() {
        emiter.on({ event1: undefined });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          }
        ]);
      });
      it('({ event1: callback1, event2: callback2, "event3 event4": callback1 })', function() {
        emiter.on({
          event1: cb1,
          event2: cb2,
          'event3 event4': cb1
        });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          },
          {
            eventName: 'event2',
            callback: cb2,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          },
          {
            eventName: 'event3',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          },
          {
            eventName: 'event4',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: undefined,
            defaultContext: emiter
          }
        ]);
      });
      it('({ event1: [callback2], event2: [context2], event3: [callback2, context2], event4: null }, callback1, context2)', function() {
        emiter.on(
          {
            event1: [cb2],
            event2: [context2],
            event3: [cb2, context2],
            event4: null
          },
          cb1,
          context1
        );
        expect(spy).to.be.calledOnce;
        let arg = spy.getCall(0).args[0];
        expect(arg.length).to.be.equal(4);
        expect(arg[0]).to.be.eql({
          eventName: 'event1',
          callback: cb2,
          context: context1,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
        expect(arg[1]).to.be.eql({
          eventName: 'event2',
          callback: cb1,
          context: context2,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
        expect(arg[2]).to.be.eql({
          eventName: 'event3',
          callback: cb2,
          context: context2,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
        expect(arg[3]).to.be.eql({
          eventName: 'event4',
          callback: undefined,
          context: undefined,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
      });
      it('({ event1: [callback2, udefined], event2: [undefined, context2], event3: undefined }, callback1, context1)', function() {
        emiter.on(
          {
            event1: [cb2, undefined],
            event2: [undefined, context2],
            event3: undefined
          },
          cb1,
          context1
        );
        expect(spy).to.be.calledOnce;
        let arg = spy.getCall(0).args[0];
        expect(arg[0]).to.be.eql({
          eventName: 'event1',
          callback: cb2,
          context: context1,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
        expect(arg[1]).to.be.eql({
          eventName: 'event2',
          callback: cb1,
          context: context2,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
        expect(arg[2]).to.be.eql({
          eventName: 'event3',
          callback: cb1,
          context: context1,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
      });
      it('({ event1: context2, event2: [wrong, wrong], event3: wrong }, callback1, context1)', function() {
        emiter.on(
          {
            event1: context2,
            event2: [123, 234],
            event3: 'wrong'
          },
          cb1,
          context1
        );
        expect(spy).to.be.calledOnce;
        let arg = spy.getCall(0).args[0];
        expect(arg[0]).to.be.eql({
          eventName: 'event1',
          callback: cb1,
          context: context2,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
        expect(arg[1]).to.be.eql({
          eventName: 'event2',
          callback: undefined,
          context: undefined,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
        expect(arg[2]).to.be.eql({
          eventName: 'event3',
          callback: undefined,
          context: undefined,
          emiter: emiter,
          listener: undefined,
          once: undefined,
          defaultContext: emiter
        });
      });
    });
    describe('once', function() {
      it('()', function() {
        emiter.once();
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('("event1")', function() {
        emiter.once('event1');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          }
        ]);
      });
      it('(callback)', function() {
        emiter.once(cb1);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('("event1", callback)', function() {
        emiter.once('event1', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          }
        ]);
      });
      it('("event1", callback, context)', function() {
        emiter.once('event1', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          }
        ]);
      });
      it('("event1 event2", callback)', function() {
        emiter.once('event1 event2', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          }
        ]);
      });
      it('("event1 event2", callback, context)', function() {
        emiter.once('event1 event2', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          }
        ]);
      });
      it('({ event1: undefined })', function() {
        emiter.once({ event1: undefined });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          }
        ]);
      });
      it('({ event1: callback1, event2: callback2 })', function() {
        emiter.once({ event1: cb1, event2: cb2 });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          },
          {
            eventName: 'event2',
            callback: cb2,
            context: undefined,
            emiter: emiter,
            listener: undefined,
            once: true,
            defaultContext: emiter
          }
        ]);
      });
      it('({ event1: [callback2], event2: [context2], event3: [callback2, context2], event4: null }, callback1, context1)', function() {
        emiter.once(
          {
            event1: [cb2],
            event2: [context2],
            event3: [cb2, context2],
            event4: null
          },
          cb1,
          context1
        );
        expect(spy).to.be.calledOnce;
        let arg = spy.getCall(0).args[0];
        expect(arg.length).to.be.equal(4);
        expect(arg[0]).to.be.eql({
          eventName: 'event1',
          callback: cb2,
          context: context1,
          emiter: emiter,
          listener: undefined,
          once: true,
          defaultContext: emiter
        });
        expect(arg[1]).to.be.eql({
          eventName: 'event2',
          callback: cb1,
          context: context2,
          emiter: emiter,
          listener: undefined,
          once: true,
          defaultContext: emiter
        });
        expect(arg[2]).to.be.eql({
          eventName: 'event3',
          callback: cb2,
          context: context2,
          emiter: emiter,
          listener: undefined,
          once: true,
          defaultContext: emiter
        });
        expect(arg[3]).to.be.eql({
          eventName: 'event4',
          callback: undefined,
          context: undefined,
          emiter: emiter,
          listener: undefined,
          once: true,
          defaultContext: emiter
        });
      });
    });
    describe('listenTo', function() {
      it('()', function() {
        listener.listenTo();
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('(emiter)', function() {
        listener.listenTo(emiter);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('("event1")', function() {
        listener.listenTo('event1');
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('(callback)', function() {
        listener.listenTo(cb1);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });

      it('(emiter, callback)', function() {
        listener.listenTo(emiter, cb1);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });

      it('(emiter, "event1")', function() {
        listener.listenTo(emiter, 'event1');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          }
        ]);
      });

      it('(emiter, "event1", callback)', function() {
        listener.listenTo(emiter, 'event1', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, "event1", callback, context)', function() {
        listener.listenTo(emiter, 'event1', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, "event1 event2", callback)', function() {
        listener.listenTo(emiter, 'event1 event2', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, "event1 event2", callback, context)', function() {
        listener.listenTo(emiter, 'event1 event2', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, { event1: undefined })', function() {
        listener.listenTo(emiter, { event1: undefined });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, { event1: callback1, event2: callback2 })', function() {
        listener.listenTo(emiter, { event1: cb1, event2: cb2 });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          },
          {
            eventName: 'event2',
            callback: cb2,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: undefined,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, { event1: [callback2], event2: [context2], event3: [callback2, context2], event4: null }, callback1, context1)', function() {
        listener.listenTo(
          emiter,
          {
            event1: [cb2],
            event2: [context2],
            event3: [cb2, context2],
            event4: null
          },
          cb1,
          context1
        );
        expect(spy).to.be.calledOnce;
        let arg = spy.getCall(0).args[0];
        expect(arg.length).to.be.equal(4);
        expect(arg[0]).to.be.eql({
          eventName: 'event1',
          callback: cb2,
          context: context1,
          emiter: emiter,
          listener: listener,
          once: undefined,
          defaultContext: listener
        });
        expect(arg[1]).to.be.eql({
          eventName: 'event2',
          callback: cb1,
          context: context2,
          emiter: emiter,
          listener: listener,
          once: undefined,
          defaultContext: listener
        });
        expect(arg[2]).to.be.eql({
          eventName: 'event3',
          callback: cb2,
          context: context2,
          emiter: emiter,
          listener: listener,
          once: undefined,
          defaultContext: listener
        });
        expect(arg[3]).to.be.eql({
          eventName: 'event4',
          callback: undefined,
          context: undefined,
          emiter: emiter,
          listener: listener,
          once: undefined,
          defaultContext: listener
        });
      });
    });
    describe('listenToOnce', function() {
      it('()', function() {
        listener.listenToOnce();
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('(emiter)', function() {
        listener.listenToOnce(emiter);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('("event1")', function() {
        listener.listenToOnce('event1');
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('(callback)', function() {
        listener.listenToOnce(cb1);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });
      it('(emiter, callback)', function() {
        listener.listenToOnce(emiter, cb1);
        expect(spy).to.be.calledOnce.and.calledWith(undefined);
      });

      it('(emiter, "event1")', function() {
        listener.listenToOnce(emiter, 'event1');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          }
        ]);
      });

      it('(emiter, "event1", callback)', function() {
        listener.listenToOnce(emiter, 'event1', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, "event1", callback, context)', function() {
        listener.listenToOnce(emiter, 'event1', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, "event1 event2", callback)', function() {
        listener.listenToOnce(emiter, 'event1 event2', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, "event1 event2", callback, context)', function() {
        listener.listenToOnce(emiter, 'event1 event2', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, { event1: undefined })', function() {
        listener.listenToOnce(emiter, { event1: undefined });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, { event1: callback1, event2: callback2 })', function() {
        listener.listenToOnce(emiter, { event1: cb1, event2: cb2 });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          },
          {
            eventName: 'event2',
            callback: cb2,
            context: undefined,
            emiter: emiter,
            listener: listener,
            once: true,
            defaultContext: listener
          }
        ]);
      });
      it('(emiter, { event1: [callback2], event2: [context2], event3: [callback2, context2], event4: null }, callback1, context1)', function() {
        listener.listenToOnce(
          emiter,
          {
            event1: [cb2],
            event2: [context2],
            event3: [cb2, context2],
            event4: null
          },
          cb1,
          context1
        );
        expect(spy).to.be.calledOnce;
        let arg = spy.getCall(0).args[0];
        expect(arg.length).to.be.equal(4);
        expect(arg[0]).to.be.eql({
          eventName: 'event1',
          callback: cb2,
          context: context1,
          emiter: emiter,
          listener: listener,
          once: true,
          defaultContext: listener
        });
        expect(arg[1]).to.be.eql({
          eventName: 'event2',
          callback: cb1,
          context: context2,
          emiter: emiter,
          listener: listener,
          once: true,
          defaultContext: listener
        });
        expect(arg[2]).to.be.eql({
          eventName: 'event3',
          callback: cb2,
          context: context2,
          emiter: emiter,
          listener: listener,
          once: true,
          defaultContext: listener
        });
        expect(arg[3]).to.be.eql({
          eventName: 'event4',
          callback: undefined,
          context: undefined,
          emiter: emiter,
          listener: listener,
          once: true,
          defaultContext: listener
        });
      });
    });
  });

  describe('triggerEvents', function() {
    beforeEach(function() {
      spy = this.sinon.spy(api, 'triggerEvents');
    });
    it('()', function() {
      emiter.trigger();
      expect(spy).to.be.calledOnce.and.calledWith(undefined);
    });
    it('(callback)', function() {
      emiter.trigger(() => {});
      expect(spy).to.be.calledOnce.and.calledWith(undefined);
    });
    it('(123)', function() {
      emiter.trigger(123);
      expect(spy).to.be.calledOnce.and.calledWith(undefined);
    });
    it('("event1")', function() {
      emiter.trigger('event1');
      expect(spy).to.be.calledOnce.and.calledWith([
        {
          emiter: emiter,
          triggerArgs: [],
          eventName: 'event1'
        }
      ]);
    });
    it('("event1", 1, 2, 3)', function() {
      emiter.trigger('event1', 1, 2, 3);
      expect(spy).to.be.calledOnce.and.calledWith([
        {
          emiter: emiter,
          triggerArgs: [1, 2, 3],
          eventName: 'event1'
        }
      ]);
    });
    it('("event1 event2")', function() {
      emiter.trigger('event1 event2');
      expect(spy).to.be.calledOnce.and.calledWith([
        {
          emiter: emiter,
          triggerArgs: [],
          eventName: 'event1'
        },
        {
          emiter: emiter,
          triggerArgs: [],
          eventName: 'event2'
        }
      ]);
    });
    it('({ event1: null, event2: [args], "event3 event4": ["baz"] }, ...args)', function() {
      emiter.trigger(
        {
          event1: null,
          event2: ['foo', 'bar'],
          'event3 event4': ['baz']
        },
        1,
        2,
        3
      );
      expect(spy).to.be.calledOnce;
      expect(spy).to.be.calledOnce.and.calledWith([
        {
          emiter: emiter,
          triggerArgs: [1, 2, 3],
          eventName: 'event1'
        },
        {
          emiter: emiter,
          triggerArgs: ['foo', 'bar'],
          eventName: 'event2'
        },
        {
          emiter: emiter,
          triggerArgs: ['baz'],
          eventName: 'event3'
        },
        {
          emiter: emiter,
          triggerArgs: ['baz'],
          eventName: 'event4'
        }
      ]);
    });
  });

  describe('removeEvents', function() {
    beforeEach(function() {
      cb1 = () => {};
      cb2 = () => {};
      spy = this.sinon.spy(api, 'removeEvents');
    });
    describe('off', function() {
      it('()', function() {
        emiter.off();
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            emiter,
            callback: undefined,
            context: undefined,
            eventName: undefined,
            listener: undefined
          }
        ]);
      });
      it('("event")', function() {
        emiter.off('event1');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('(callback)', function() {
        emiter.off(cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('(null, callback)', function() {
        emiter.off(null, cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('(null, null, context)', function() {
        emiter.off(null, null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('(event, callback)', function() {
        emiter.off('event1', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('(event, context)', function() {
        emiter.off('event1', context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('(event, null, context)', function() {
        emiter.off('event1', null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('(callback, context)', function() {
        emiter.off(cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('("event1 event2")', function() {
        emiter.off('event1 event2');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('("event1 event2", callback)', function() {
        emiter.off('event1 event2', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('("event1 event2", callback, context)', function() {
        emiter.off('event1 event2', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('("event1 event2", null, context)', function() {
        emiter.off('event1 event2', null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('("event1 event2", context)', function() {
        emiter.off('event1 event2', context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('({ event1: callback, event2: context, event3: [callback, context], event4: null })', function() {
        emiter.off({
          event1: cb1,
          event2: context1,
          event3: [cb1, context1],
          event4: null
        });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event3',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event4',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined
          }
        ]);
      });
      it('({ event1: callback, event2: context, event3: [callback, context], event4: null, event5: [] }), callback, context', function() {
        emiter.off(
          {
            event1: cb1,
            event2: context1,
            event3: [cb1, context1],
            event4: null,
            event5: []
          },
          cb2,
          context2
        );
        //console.log(spy.getCall(0).args[0][4]);
        let expected = [
          {
            eventName: 'event1',
            callback: cb1,
            context: context2,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event2',
            callback: cb2,
            context: context1,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event3',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event4',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: undefined
          },
          {
            eventName: 'event5',
            callback: cb2,
            context: context2,
            emiter: emiter,
            listener: undefined
          }
        ];
        //console.log(spy.getCall(0).args[0][3]);
        expect(spy.getCall(0).args[0][0]).to.be.eql(expected[0]);
        expect(spy.getCall(0).args[0][1]).to.be.eql(expected[1]);
        expect(spy.getCall(0).args[0][2]).to.be.eql(expected[2]);
        expect(spy.getCall(0).args[0][3]).to.be.eql(expected[3]);
        expect(spy.getCall(0).args[0][4]).to.be.eql(expected[4]);
        //expect(spy.getCall(0).args[0][5]).to.be.eql(expected[5]);
        //expect(spy).to.be.calledOnce.and.calledWith(expected);
      });
    });
    describe('stopListening', function() {
      it('()', function() {
        listener.stopListening();
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            emiter: undefined,
            eventName: undefined,
            callback: undefined,
            context: undefined,
            listener
          }
        ]);
      });
      it('("event")', function() {
        listener.stopListening('event1');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(callback)', function() {
        listener.stopListening(cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: undefined,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(null, callback)', function() {
        listener.stopListening(null, cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: undefined,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(null, null, context)', function() {
        listener.stopListening(null, null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(null, null, null, context)', function() {
        listener.stopListening(null, null, null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(event, callback)', function() {
        listener.stopListening('event1', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(event, context)', function() {
        listener.stopListening('event1', context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(event, null, context)', function() {
        listener.stopListening('event1', null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(callback, context)', function() {
        listener.stopListening(cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('("event1 event2")', function() {
        listener.stopListening('event1 event2');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: undefined,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", callback)', function() {
        listener.stopListening('event1 event2', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: undefined,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", callback, context)', function() {
        listener.stopListening('event1 event2', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", null, context)', function() {
        listener.stopListening('event1 event2', null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", context)', function() {
        listener.stopListening('event1 event2', context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(null, { event1: callback, event2: context, event3: [callback, context], event4: null })', function() {
        listener.stopListening(null, {
          event1: cb1,
          event2: context1,
          event3: [cb1, context1],
          event4: null
        });
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event3',
            callback: cb1,
            context: context1,
            emiter: undefined,
            listener: listener
          },
          {
            eventName: 'event4',
            callback: undefined,
            context: undefined,
            emiter: undefined,
            listener: listener
          }
        ]);
      });
      it('(emiter, { event1: callback, event2: context, event3: [callback, context], event4: null, event5: [] }), callback, context', function() {
        listener.stopListening(
          emiter,
          {
            event1: cb1,
            event2: context1,
            event3: [cb1, context1],
            event4: null,
            event5: []
          },
          cb2,
          context2
        );
        //console.log(spy.getCall(0).args[0][4]);
        let expected = [
          {
            eventName: 'event1',
            callback: cb1,
            context: context2,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: cb2,
            context: context1,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event3',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event4',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event5',
            callback: cb2,
            context: context2,
            emiter: emiter,
            listener: listener
          }
        ];
        //console.log(spy.getCall(0).args[0][3]);
        // expect(spy.getCall(0).args[0][0]).to.be.eql(expected[0]);
        // expect(spy.getCall(0).args[0][1]).to.be.eql(expected[1]);
        // expect(spy.getCall(0).args[0][2]).to.be.eql(expected[2]);
        // expect(spy.getCall(0).args[0][3]).to.be.eql(expected[3]);
        // expect(spy.getCall(0).args[0][4]).to.be.eql(expected[4]);
        //expect(spy.getCall(0).args[0][5]).to.be.eql(expected[5]);
        expect(spy).to.be.calledOnce.and.calledWith(expected);
      });

      it('("event")', function() {
        listener.stopListening(emiter, 'event1');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(callback)', function() {
        listener.stopListening(emiter, cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(null, callback)', function() {
        listener.stopListening(emiter, null, cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(null, null, context)', function() {
        listener.stopListening(emiter, null, null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(emiter, null, null, context)', function() {
        listener.stopListening(emiter, null, null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(event, callback)', function() {
        listener.stopListening(emiter, 'event1', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(event, context)', function() {
        listener.stopListening(emiter, 'event1', context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(event, null, context)', function() {
        listener.stopListening(emiter, 'event1', null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('(callback, context)', function() {
        listener.stopListening(emiter, cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: undefined,
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('("event1 event2")', function() {
        listener.stopListening(emiter, 'event1 event2');
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: undefined,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", callback)', function() {
        listener.stopListening(emiter, 'event1 event2', cb1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: undefined,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", callback, context)', function() {
        listener.stopListening(emiter, 'event1 event2', cb1, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: cb1,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", null, context)', function() {
        listener.stopListening(emiter, 'event1 event2', null, context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
      it('("event1 event2", context)', function() {
        listener.stopListening(emiter, 'event1 event2', context1);
        expect(spy).to.be.calledOnce.and.calledWith([
          {
            eventName: 'event1',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          },
          {
            eventName: 'event2',
            callback: undefined,
            context: context1,
            emiter: emiter,
            listener: listener
          }
        ]);
      });
    });
  });
});
