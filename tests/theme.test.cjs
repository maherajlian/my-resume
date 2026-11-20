const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '../site/theme.js'), 'utf8');

function browser({ saved = null, dark = false, blocked = false, loading = false, matchMedia = true } = {}) {
  const listeners = {};
  const root = { dataset: {} };
  const button = {
    hidden: true,
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { listeners[`button:${name}`] = callback; },
  };
  const meta = { setAttribute(name, value) { this[name] = value; } };
  const storage = new Map(saved === null ? [] : [['resume-theme', saved]]);
  const media = {
    matches: dark,
    addEventListener(name, callback) { listeners[`media:${name}`] = callback; },
  };
  const window = {
    localStorage: {
      getItem(key) {
        if (blocked) throw new Error('Storage blocked');
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        if (blocked) throw new Error('Storage blocked');
        storage.set(key, value);
      },
    },
    addEventListener(name, callback) { listeners[`window:${name}`] = callback; },
  };
  if (matchMedia) window.matchMedia = () => media;
  const document = {
    documentElement: root,
    readyState: loading ? 'loading' : 'complete',
    querySelector: () => meta,
    getElementById: () => button,
    addEventListener(name, callback) { listeners[`document:${name}`] = callback; },
  };
  vm.runInNewContext(source, { window, document });
  return {
    root, button, meta, storage,
    click: () => listeners['button:click'](),
    ready: () => listeners['document:DOMContentLoaded'](),
    system(value) { media.matches = value; listeners['media:change'](); },
    storageEvent(event) { listeners['window:storage'](event); },
  };
}

test('uses light system preference by default', () => {
  const page = browser();
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(page.button.attributes['aria-pressed'], 'false');
  assert.equal(page.button.hidden, false);
});

test('applies dark system preference before the DOM is ready', () => {
  const page = browser({ dark: true, loading: true });
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.meta.content, '#141b18');
  assert.equal(page.button.hidden, true);
  page.ready();
  assert.equal(page.button.hidden, false);
  assert.equal(page.button.attributes['aria-pressed'], 'true');
});

test('saved preference overrides system preference on reload', () => {
  assert.equal(browser({ saved: 'light', dark: true }).root.dataset.theme, 'light');
  assert.equal(browser({ saved: 'dark', dark: false }).root.dataset.theme, 'dark');
});

test('toggle persists both choices and updates accessible state and browser colour', () => {
  const page = browser();
  page.click();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.storage.get('resume-theme'), 'dark');
  assert.equal(page.button.attributes['aria-pressed'], 'true');
  assert.equal(page.meta.content, '#141b18');
  page.click();
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(page.storage.get('resume-theme'), 'light');
  assert.equal(page.button.attributes['aria-pressed'], 'false');
  assert.equal(page.meta.content, '#f7f7f2');
});

test('follows system changes until the user chooses a theme', () => {
  const page = browser();
  page.system(true);
  assert.equal(page.root.dataset.theme, 'dark');
  page.click();
  page.system(false);
  page.system(true);
  assert.equal(page.root.dataset.theme, 'light');
});

test('invalid storage values fall back to system preference', () => {
  assert.equal(browser({ saved: 'unexpected', dark: true }).root.dataset.theme, 'dark');
});

test('blocked storage does not break theme selection', () => {
  const page = browser({ blocked: true, dark: true });
  assert.equal(page.root.dataset.theme, 'dark');
  assert.doesNotThrow(() => page.click());
  assert.equal(page.root.dataset.theme, 'light');
  page.system(true);
  assert.equal(page.root.dataset.theme, 'light');
});

test('works without matchMedia support', () => {
  const page = browser({ matchMedia: false });
  assert.equal(page.root.dataset.theme, 'light');
  page.click();
  assert.equal(page.root.dataset.theme, 'dark');
});

test('syncs preference updates across tabs and follows system when cleared', () => {
  const page = browser({ dark: true });
  page.storageEvent({ key: 'resume-theme', newValue: 'light' });
  assert.equal(page.root.dataset.theme, 'light');
  page.storageEvent({ key: 'resume-theme', newValue: null });
  assert.equal(page.root.dataset.theme, 'dark');
  page.storageEvent({ key: 'other-setting', newValue: 'light' });
  assert.equal(page.root.dataset.theme, 'dark');
  page.storageEvent({ key: null, newValue: null });
  assert.equal(page.root.dataset.theme, 'dark');
});
