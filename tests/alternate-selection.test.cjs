const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function signal(initial) {
  let value = initial;
  const read = () => value;
  read.set = next => { value = next; };
  read.update = fn => { value = fn(value); };
  return read;
}

function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => {
    if (name === '@angular/core') return { Injectable: () => target => target, signal, computed: fn => fn, inject: token => dependencies[token.name] };
    if (name === './product.service') return { ProductService: class ProductService {} };
    if (name === './cart.service') return { CartService: class CartService {} };
    throw new Error(`Unexpected dependency: ${name}`);
  }});
  return exports;
}

function setup(items) {
  const { CartService } = load('../src/app/core/services/cart.service.ts');
  const cart = new CartService();
  cart.cartItems.set(items);
  const original = { id: 1, title: 'Unavailable', categorySlug: 'grocery', inStock: false, price: 100 };
  const replacement = { id: 2, title: 'Replacement', categorySlug: 'grocery', inStock: true, price: 150 };
  const products = { getProducts: () => [original, replacement] };
  const { AlternateModalService } = load('../src/app/core/services/alternate-modal.service.ts', { ProductService: products, CartService: cart });
  const modal = new AlternateModalService();
  return { cart, original, replacement, modal };
}

test('selecting an alternative replaces unavailable variants and preserves existing replacement quantity', () => {
  const original = { id: 1, inStock: false, price: 100 };
  const replacement = { id: 2, inStock: true, price: 150 };
  const { cart, modal, original: product } = setup([
    { product: original, variant: { id: 'large', price: 100 }, quantity: 2, outOfStockChoice: 'best-match' },
    { product: replacement, quantity: 3 }
  ]);
  modal.open(product);
  modal.selectAlternateProduct(replacement);
  modal.confirmSelection();
  assert.equal(cart.cartItems().length, 1);
  assert.equal(cart.cartItems()[0].product.id, 2);
  assert.equal(cart.cartItems()[0].quantity, 5);
  assert.equal(cart.cartTotal(), 750);
});

test('selecting an alternative when the unavailable product is not in the cart adds one item', () => {
  const { cart, modal, original, replacement } = setup([]);
  modal.open(original);
  modal.selectAlternateProduct(replacement);
  modal.confirmSelection();
  assert.equal(cart.cartItems().length, 1);
  assert.equal(cart.cartItems()[0].product.id, 2);
  assert.equal(cart.cartItems()[0].quantity, 1);
});

test('best-match preserves an existing unavailable variant and its quantity', () => {
  const original = { id: 1, inStock: false, price: 100 };
  const { cart, modal, original: product } = setup([{ product: original, variant: { id: 'large', price: 100 }, quantity: 2 }]);
  modal.open(product);
  modal.setChoice('best-match');
  modal.confirmSelection();
  assert.equal(cart.cartItems().length, 1);
  assert.equal(cart.cartItems()[0].variant.id, 'large');
  assert.equal(cart.cartItems()[0].quantity, 2);
  assert.equal(cart.cartItems()[0].outOfStockChoice, 'best-match');
});
