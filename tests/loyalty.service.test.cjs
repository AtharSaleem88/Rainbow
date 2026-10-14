const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Run the service with controlled auth/cart signals and browser storage.
const source = fs.readFileSync(path.join(__dirname, '../src/app/core/services/loyalty.service.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
}).outputText;
function signal(initial) {
  let value = initial;
  const read = () => value;
  read.set = next => { value = next; };
  read.update = update => { value = update(value); };
  return read;
}

function createService(storage = new Map(), options = {}) {
  class AuthService {}
  class CartService {}
  const auth = { isLoggedIn: signal(true), userProfile: signal({ email: 'member@example.com' }) };
  const cart = { cartTotal: signal(510) };
  const exports = {};
  const localStorage = {
    getItem: key => {
      if (options.unavailable) throw new Error('Storage unavailable');
      return storage.get(key) ?? null;
    },
    setItem: (key, value) => {
      if (options.unavailable) throw new Error('Storage unavailable');
      storage.set(key, value);
    }
  };
  vm.runInNewContext(compiled, {
    exports, localStorage,
    require: name => {
      if (name === '@angular/core') return {
        signal, computed: compute => compute, Injectable: () => target => target,
        inject: token => token === AuthService ? auth : cart
      };
      if (name === './auth.service') return { AuthService };
      if (name === './cart.service') return { CartService };
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  return { service: new exports.LoyaltyService(), auth, cart, storage };
}

test('points use completed spending thresholds and reject invalid amounts', () => {
  const { service } = createService();
  for (const [amount, points] of [[0, 0], [99.99, 0], [100, 1], [199.99, 1], [510, 5], [-100, 0], [NaN, 0], [Infinity, 0]]) {
    assert.equal(service.pointsForAmount(amount), points);
  }
});

test('cart estimate reacts to totals without crediting the balance', () => {
  const { service, cart } = createService();
  assert.equal(service.cartPoints(), 5);
  cart.cartTotal.set(690);
  assert.equal(service.cartPoints(), 6);
  assert.equal(service.balance(), 0);
});

test('orders credit once and retain an earning record', () => {
  const { service } = createService();
  assert.equal(service.creditOrder('RH-1', 510), 5);
  assert.equal(service.creditOrder('RH-1', 510), 0);
  assert.equal(service.creditOrder('RH-1', 1000), 0);
  assert.equal(service.balance(), 5);
  assert.equal(service.history().length, 1);
  assert.equal(service.history()[0].orderId, 'RH-1');
  assert.equal(service.history()[0].totalAmount, 510);
});

test('guests cannot earn or see member points', () => {
  const { service, auth } = createService();
  service.creditOrder('RH-1', 510);
  auth.isLoggedIn.set(false);
  assert.equal(service.cartPoints(), 0);
  assert.equal(service.balance(), 0);
  assert.equal(service.history().length, 0);
  assert.equal(service.creditOrder('RH-2', 510), 0);
  auth.isLoggedIn.set(true);
  assert.equal(service.balance(), 5);
});

test('balances are isolated per normalized account email', () => {
  const { service, auth } = createService();
  service.creditOrder('RH-1', 510);
  auth.userProfile.set({ email: 'second@example.com' });
  assert.equal(service.balance(), 0);
  assert.equal(service.creditOrder('RH-1', 1000), 10);
  auth.userProfile.set({ email: ' MEMBER@example.com ' });
  assert.equal(service.balance(), 5);
  assert.equal(service.history().length, 1);
});

test('points and duplicate protection survive a service reload', () => {
  const first = createService();
  first.service.creditOrder('RH-1', 510);
  const reloaded = createService(first.storage).service;
  assert.equal(reloaded.balance(), 5);
  assert.equal(reloaded.creditOrder('RH-1', 510), 0);
});

test('invalid storage and duplicate records do not inflate the balance', () => {
  const original = createService();
  original.service.creditOrder('RH-1', 510);
  const entry = JSON.parse(original.storage.get('rainbow-loyalty-v1'))[0];
  original.storage.set('rainbow-loyalty-v1', JSON.stringify([entry, entry, { ...entry, orderId: 'RH-2', points: 999 }, null]));
  assert.equal(createService(original.storage).service.balance(), 5);
  for (const value of ['invalid JSON', '{}', 'null']) {
    assert.equal(createService(new Map([['rainbow-loyalty-v1', value]])).service.balance(), 0);
  }
});

test('unavailable storage preserves earning during the current session', () => {
  const { service } = createService(new Map(), { unavailable: true });
  assert.equal(service.creditOrder('RH-1', 510), 5);
  assert.equal(service.balance(), 5);
});

test('redemption debits only available whole points and cannot repeat', () => {
  const { service } = createService();
  service.creditOrder('RH-EARN', 1000);
  for (const points of [0, -1, 1.5, 11, NaN, Infinity]) assert.equal(service.redeemOrder('RH-USE', points), false);
  assert.equal(service.balance(), 10);
  assert.equal(service.redeemOrder('RH-USE', 6), true);
  assert.equal(service.balance(), 4);
  assert.equal(service.redeemOrder('RH-USE', 1), false);
  assert.equal(service.creditOrder('RH-USE', 494), 4);
  assert.equal(service.balance(), 8);
  assert.equal(service.history()[1].points, -6);
});

test('redeemed points and their duplicate protection survive reload', () => {
  const first = createService();
  first.service.creditOrder('RH-EARN', 1000);
  first.service.redeemOrder('RH-USE', 6);
  const reloaded = createService(first.storage).service;
  assert.equal(reloaded.balance(), 4);
  assert.equal(reloaded.redeemOrder('RH-USE', 1), false);
});

test('guests cannot redeem points', () => {
  const { service, auth } = createService();
  service.creditOrder('RH-EARN', 1000);
  auth.isLoggedIn.set(false);
  assert.equal(service.redeemOrder('RH-USE', 6), false);
  auth.isLoggedIn.set(true);
  assert.equal(service.balance(), 10);
});
