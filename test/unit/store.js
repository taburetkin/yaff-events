import { setInterop, getInterop } from '../../store';

class Custom {}
class DeepCustom extends Custom {}

describe('getInterop', function() {
  afterEach(function() {
    setInterop(Custom, null);
    setInterop(DeepCustom, null);
  });
  it('should search by constructor', function() {
    let instance = new DeepCustom();
    let interop = { foo: 'bar' };
    setInterop(Custom, interop);
    let result = getInterop(instance);
    expect(result).to.be.equal(interop);
  });
});
