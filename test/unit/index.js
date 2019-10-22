import { Events } from '../../index';

class Inst {
  onEvent1(arg) {
    return arg;
  }
}
Object.assign(Inst.prototype, Events);

describe('triggerMethod', function() {
  let inst;
  let onSpy;
  let eventSpy;
  beforeEach(function() {
    inst = new Inst();
    eventSpy = this.sinon.spy();
    onSpy = this.sinon.spy(inst, 'onEvent1');
  });
  it('should call `onEvent` method before any registered callbacks', function() {
    inst.on('event1', eventSpy);
    inst.triggerMethod('event1');
    expect(onSpy).to.be.calledOnce.and.be.calledBefore(eventSpy);
  });
  it('should not throw if there is no such method', function() {
    inst.on('event2', eventSpy);
    expect(
      inst.triggerMethod.bind(inst, 'event2'),
      'should not throw'
    ).to.not.throw();
    expect(eventSpy, 'and should process binded callbacks').to.been.calledOnce;
  });
  it('should pass given arguments', function() {
    let args = ['foo', 'bar', 123];
    inst.triggerMethod('event1', ...args);
    expect(onSpy).to.been.calledOnce.and.calledWith(...args);
  });
  it('should return last result', function() {
    let bar = {};
    let result = inst.triggerMethod('event0 event1', bar);
    expect(bar).to.be.equal(bar);
  });
});
