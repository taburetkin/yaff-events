import { Instance } from '../tests-helpers';

describe('when interop does not support `on`', function() {
  let listener;
  let cb1;
  beforeEach(function() {
    cb1 = () => {};
    listener = new Instance();
  });
  it('should throw', function() {
    let emiter = {};
    expect(listener.listenTo.bind(listener, emiter, 'event', cb1)).to.throw();
  });
});
