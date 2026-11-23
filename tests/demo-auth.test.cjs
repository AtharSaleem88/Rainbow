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
  first.login('shopper@example.com');
  const reloaded = service(storage);
  assert.equal(reloaded.isLoggedIn(), true);
  assert.equal(reloaded.userProfile().email, 'shopper@example.com');
  reloaded.logout();
  assert.equal(service(storage).isLoggedIn(), false);
});
test('unavailable storage falls back to a signed-out demo session', () => {
  const storage = { getItem: () => { throw new Error('Unavailable'); }, setItem: () => { throw new Error('Unavailable'); } };
  const auth = service(storage);
  assert.equal(auth.isLoggedIn(), false);
  auth.login('shopper@example.com');
  assert.equal(auth.isLoggedIn(), true);
  auth.logout();
  assert.equal(auth.isLoggedIn(), false);
});
