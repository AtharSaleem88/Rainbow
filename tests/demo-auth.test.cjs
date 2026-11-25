const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/app/core/services/auth.service.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true } }).outputText;
function signal(initial) {
  let value = initial;
  const read = () => value;
  read.set = next => { value = next; };
  read.update = fn => { value = fn(value); };
  return read;
}
function service(storage) {
  const exports = {};
  vm.runInNewContext(compiled, { exports, localStorage: storage, require: name => {
    if (name === '@angular/core') return { signal, computed: fn => fn, Injectable: () => target => target };
    throw new Error(`Unexpected dependency: ${name}`);
  }});
  return new exports.AuthService();
}
test('demo sign-in and logout persist across reloads', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const first = service(storage);
  assert.equal(first.isLoggedIn(), false);
  assert.equal(first.login('0300 1234567'), true);
  const reloaded = service(storage);
  assert.equal(reloaded.isLoggedIn(), true);
  assert.equal(reloaded.userProfile().phone, '923001234567');
  reloaded.logout();
  assert.equal(service(storage).isLoggedIn(), false);
});
test('unavailable storage falls back to a signed-out demo session', () => {
  const storage = { getItem: () => { throw new Error('Unavailable'); }, setItem: () => { throw new Error('Unavailable'); } };
  const auth = service(storage);
  assert.equal(auth.isLoggedIn(), false);
  auth.login('+92 300 1234567');
  assert.equal(auth.isLoggedIn(), true);
  auth.logout();
  assert.equal(auth.isLoggedIn(), false);
});
test('invalid numbers cannot create a phone session and legacy email sessions require sign-in', () => {
  const values = new Map([['rainbow-auth-v1', 'signed-in'], ['rainbow-email-v1', 'old@example.com']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const auth = service(storage);
  assert.equal(auth.isLoggedIn(), false);
  for (const invalid of ['shopper@example.com', 'abc03001234567', '123', '']) assert.equal(auth.login(invalid), false);
  assert.equal(auth.isLoggedIn(), false);
});
test('wallet balances are isolated by normalized phone and survive reload', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const auth = service(storage);
  auth.login('03001234567');
  assert.equal(auth.walletBalance(), 0);
  auth.topUpWallet(200);
  auth.debitWallet(50);
  auth.login('03111234567');
  assert.equal(auth.walletBalance(), 0);
  auth.login('+92 300 1234567');
  assert.equal(auth.walletBalance(), 150);
  assert.equal(service(storage).walletBalance(), 150);
});
