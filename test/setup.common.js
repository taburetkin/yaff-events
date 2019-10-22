const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiPromise = require('chai-as-promised');

chai.use(chaiPromise);
chai.use(sinonChai);

global.chai = chai;
global.sinon = sinon;
global.expect = global.chai.expect;

beforeEach(function() {
  this.sinon = global.sinon.createSandbox();
});

afterEach(function() {
  this.sinon.restore();
});

// global.console.log = () => {};
// global.console.error = () => {};
// console.log = () => {};
// console.error = () => {};
