const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function compile(relativePath) {
  return ts.transpileModule(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText;
}

function setup() {
  const metadata = {};
  vm.runInNewContext(compile('../src/app/core/models/grocery-categories.ts'), { exports: metadata });
  const exports = {};
  vm.runInNewContext(compile('../src/app/core/services/product.service.ts'), { exports, require: name => {
    if (name === '@angular/core') return { Injectable: () => target => target, signal: value => () => value };
    if (name === '../models/grocery-categories') return metadata;
    throw new Error(`Unexpected dependency: ${name}`);
  }});
  return new exports.ProductService();
}

test('Grocery is available as a department with illustrated demo sections', () => {
  const service = setup();
  assert.equal(service.getCategories()[1].slug, 'grocery');
  assert.equal(service.getCategories().find(category => category.slug === 'grocery').name, 'Grocery');
  const sections = service.getGrocerySections();
  assert.ok(sections.length >= 12);
  assert.equal(new Set(sections.map(section => section.name)).size, sections.length);
  for (const section of sections) assert.ok(fs.existsSync(path.join(__dirname, '..', section.image)), section.image);
});

test('Personal Care appears first with a full set of illustrated demo subcategories', () => {
  const service = setup();
  assert.equal(service.getCategories()[0].slug, 'personal-care');
  const sections = service.getPersonalCareSections();
  assert.equal(sections.length, 16);
  assert.equal(new Set(sections.map(section => section.name)).size, sections.length);
  for (const section of sections) assert.ok(fs.existsSync(path.join(__dirname, '..', section.image)), section.image);
  const facial = service.getProducts({ category: 'personal-care', subCategory: 'Facial Care' });
  assert.ok(facial.length);
  assert.ok(facial.every(product => ['Face Cleansers', 'Face Creams', 'Serums & Treatments'].includes(product.subCategory)));
  assert.equal(service.getProducts({ category: 'personal-care', subCategory: 'Makeup' }).length, 0);
});

test('Grocery includes existing pantry, fresh and dairy products without duplicating them', () => {
  const products = setup().getProducts({ category: 'grocery' });
  assert.ok(products.some(product => product.categorySlug === 'grocery'));
  assert.ok(products.some(product => product.categorySlug === 'ultra-fresh'));
  assert.ok(products.some(product => product.categorySlug === 'dairy-eggs'));
  assert.equal(new Set(products.map(product => product.id)).size, products.length);
});

test('grocery section selections return only matching products and retain normal filters', () => {
  const service = setup();
  const rice = service.getProducts({ category: 'grocery', subCategory: 'Atta, Rice & Dal' });
  assert.ok(rice.length);
  assert.ok(rice.every(product => product.categorySlug === 'grocery' && ['Rice & Grains', 'Pulses'].includes(product.subCategory)));
  const dairy = service.getProducts({ category: 'grocery', subCategory: 'Dairy, Bread & Eggs', maxPrice: 200 });
  assert.ok(dairy.length);
  assert.ok(dairy.every(product => product.categorySlug === 'dairy-eggs' && product.price <= 200));
  assert.ok(service.getProducts({ category: 'frozen-food' }).every(product => product.categorySlug === 'frozen-food'));
});
