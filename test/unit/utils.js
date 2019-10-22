import { newid, groupBy } from '../../utils';
import { getObjectId } from '../../store';

describe('newid', function() {
  it('should return id on ()', function() {
    let id = newid();
    expect(id).to.be.equal('1');
  });
  it('should increment on second call ()', function() {
    let id = newid();
    expect(id).to.be.equal('2');
  });
  it("should return id on ('key')", function() {
    let id = newid('key');
    expect(id).to.be.equal('key1');
  });
  it("should increment on second call ('key')", function() {
    let id = newid('key');
    expect(id).to.be.equal('key2');
  });
});

describe('getObjectId', function() {
  it('should throw when called with non object', function() {
    expect(getObjectId.bind(null), 'no arguments').to.throw();
    expect(getObjectId.bind(null, null), 'null').to.throw();
    expect(getObjectId.bind(null, undefined), 'undefined').to.throw();
    expect(getObjectId.bind(null, 123), 'number').to.throw();
    expect(getObjectId.bind(null, 'asd'), 'string').to.throw();
  });
  it('should not throw when called with object', function() {
    expect(getObjectId.bind(null, {}), 'object').to.not.throw();
    expect(getObjectId.bind(null, []), 'array').to.not.throw();
    expect(getObjectId.bind(null, () => {}), 'func').to.not.throw();
  });
  it('should return same id for same object', function() {
    let obj = {};
    let id = getObjectId(obj);
    let newid = getObjectId(obj);
    expect(id).to.equal(newid);
  });
  it('should return id with default prefix `obj`', function() {
    let obj = {};
    let id = getObjectId(obj);
    expect(id.startsWith('obj')).to.be.true;
  });
  it('should return id with given prefix', function() {
    let obj = {};
    let id = getObjectId(obj, 'blyamba');
    expect(id.startsWith('blyamba')).to.be.true;
  });
});

describe('groupBy', function() {
  const data = [
    {
      name: 'john',
      sex: 'male'
    },
    {
      name: 'clara',
      sex: 'female'
    },
    {
      name: 'michael',
      sex: 'male'
    },
    {
      name: 'predator'
    }
  ];
  it('should create three groups when grouping by sex', function() {
    let groups = groupBy(data, 'sex');
    expect(groups.size).to.be.equal(3);
    expect(Array.from(groups.keys())).to.be.eql(['male', 'female', undefined]);
  });
});
