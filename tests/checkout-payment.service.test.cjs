const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/core/services/checkout-payment.service.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
}).outputText;
function signal(initial) {
  let value = initial;
  const read = () => value;
  read.set = next => { value = next; };
  read.update = update => { value = update(value); };
  return read;
}
function setup() {
  class AuthService {}
  class LoyaltyService {}
  const auth = { isLoggedIn: signal(true), walletBalance: signal(200), userProfile: signal({ email: 'member@example.com' }) };
  const loyalty = {
    valuePerPoint: 1, balance: signal(50), isMember: () => auth.isLoggedIn(),
    redeemOrder: (_id, points) => {
      if (points > loyalty.balance()) return false;
      loyalty.balance.update(value => value - points);
      return true;
    }
  };
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: name => {
    if (name === '@angular/core') return { Injectable: () => target => target, inject: token => token === AuthService ? auth : loyalty };
    if (name === './auth.service') return { AuthService };
    if (name === './loyalty.service') return { LoyaltyService };
    throw new Error(`Unexpected dependency: ${name}`);
  }});
  return { calculate: exports.calculatePayment, service: new exports.CheckoutPaymentService(), auth, loyalty };
}

test('no selection, wallet only, points only, and combined partial payment', () => {
  const { calculate } = setup();
  for (const [walletOn, pointsOn, expected] of [[false,false,510], [true,false,310], [false,true,460], [true,true,260]]) {
    const payment = calculate(510,200,50,walletOn,pointsOn,1);
    assert.equal(payment.payable, expected);
    assert.equal(payment.walletApplied + payment.loyaltyDiscount + payment.payable, 510);
  }
});

test('loyalty is applied first and neither balance can exceed the order total', () => {
  const { calculate } = setup();
  const payment = calculate(510,2500,1000,true,true,1);
  assert.equal(payment.pointsUsed, 510);
  assert.equal(payment.walletApplied, 0);
  assert.equal(payment.payable, 0);
  assert.equal(calculate(510,2500,50,true,true,1).walletApplied, 460);
});

test('fractional totals are conserved in paisa and points remain whole', () => {
  const { calculate } = setup();
  const payment = calculate(510.75,20.25,500,true,true,1);
  assert.equal(payment.loyaltyDiscount, 500);
  assert.equal(payment.walletApplied, 10.75);
  assert.equal(payment.payable, 0);
  assert.equal(calculate(0.75,1,5,true,true,1).pointsUsed, 0);
  assert.equal(calculate(105,0,20,false,true,10).pointsUsed, 10);
});

test('quotes do not debit balances and settlement debits only once', () => {
  const { service, auth, loyalty } = setup();
  assert.equal(service.quote(510,true,true).payable,260);
  assert.equal(auth.walletBalance(),200);
  assert.equal(loyalty.balance(),50);
  assert.equal(service.settle('RH-1',510,true,true).payable,260);
  assert.equal(auth.walletBalance(),0);
  assert.equal(loyalty.balance(),0);
  assert.equal(service.settle('RH-1',510,true,true),null);
});

test('balance changes are recalculated at settlement', () => {
  const { service, auth, loyalty } = setup();
  service.quote(510,true,true);
  auth.walletBalance.set(30);
  loyalty.balance.set(10);
  assert.equal(service.settle('RH-1',510,true,true).payable,470);
  assert.equal(auth.walletBalance(),0);
  assert.equal(loyalty.balance(),0);
});

test('failed redemption does not debit wallet', () => {
  const { service, auth, loyalty } = setup();
  loyalty.redeemOrder = () => false;
  assert.equal(service.settle('RH-1',510,true,true),null);
  assert.equal(auth.walletBalance(),200);
});

test('guests pay the full amount and cannot spend member balances', () => {
  const { service, auth, loyalty } = setup();
  auth.isLoggedIn.set(false);
  assert.equal(service.settle('RH-1',510,true,true).payable,510);
  assert.equal(auth.walletBalance(),200);
  assert.equal(loyalty.balance(),50);
});

test('empty or invalid orders cannot spend balances', () => {
  const { service, auth } = setup();
  for (const total of [0,-1,NaN,Infinity]) assert.equal(service.settle('RH-1',total,true,true),null);
  assert.equal(service.settle('',510,true,true),null);
  assert.equal(auth.walletBalance(),200);
});
