const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = __dirname.replace(/\/tests$/, '');

function loadHtml(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function createDom() {
  const elements = [];
  const document = {
    body: {},
    querySelector(selector) {
      return elements.find((entry) => entry.selector === selector)?.element || null;
    },
    createElement(tagName) {
      return {
        tagName: tagName.toUpperCase(),
        children: [],
        attributes: {},
        style: {},
        textContent: '',
        innerHTML: '',
        className: '',
        value: '',
        href: '',
        listeners: {},
        appendChild(child) {
          this.children.push(child);
          return child;
        },
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        getAttribute(name) {
          return this.attributes[name];
        },
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        dispatchEvent(event) {
          if (this.listeners[event.type]) {
            this.listeners[event.type](event);
          }
        },
      };
    },
  };

  const register = (selector, element) => {
    elements.push({ selector, element });
  };

  const input = document.createElement('input');
  input.value = '';
  register('#league-search', input);

  const select = document.createElement('select');
  select.value = 'Revenue';
  register('#sort-select', select);

  const tableBody = document.createElement('tbody');
  tableBody.innerHTML = '';
  register('#league-rows', tableBody);

  const resultCount = document.createElement('p');
  resultCount.textContent = '0';
  register('#result-count', resultCount);

  const totalLeagues = document.createElement('p');
  totalLeagues.textContent = '0';
  register('#total-leagues', totalLeagues);

  const currentSort = document.createElement('p');
  currentSort.textContent = 'Revenue';
  register('#current-sort', currentSort);

  return { document, input, select, tableBody, resultCount, totalLeagues, currentSort };
}

test('homepage contains the expected league links and content', () => {
  const html = loadHtml('index.html');
  assert.match(html, /id="league-search"/);
  assert.match(html, /id="sort-select"/);
  assert.match(html, /id="league-rows"/);
  assert.match(html, /<th>League<\/th>/);
  assert.match(html, /<th>Country<\/th>/);
  assert.match(html, /<th>Revenue<\/th>/);
  assert.match(html, /<th>Sport<\/th>/);
  assert.match(html, /<th>League Type<\/th>/);
  assert.match(html, /<th>Founded<\/th>/);
  assert.match(html, /<th>Clubs<\/th>/);
});

test('detail pages expose the required league facts and links', () => {
  const premier = loadHtml('premier-league.html');
  const nfl = loadHtml('nfl.html');

  assert.match(premier, /Premier League/);
  assert.match(premier, /England/);
  assert.match(premier, /Football/);
  assert.match(premier, /Professional/);
  assert.match(premier, /Founded/);
  assert.match(premier, /Clubs/);
  assert.match(premier, /href="index\.html"/);

  assert.match(nfl, /National Football League/);
  assert.match(nfl, /United States/);
  assert.match(nfl, /American Football/);
  assert.match(nfl, /Professional/);
  assert.match(nfl, /Founded/);
  assert.match(nfl, /Clubs/);
  assert.match(nfl, /href="premier-league\.html"/);
});

test('search and sort logic filters rows and updates the result count', () => {
  const { document, input, select, tableBody, resultCount, totalLeagues, currentSort } = createDom();
  const context = { document, console, window: { addEventListener() {} } };
  context.window = context.window;
  context.global = context;
  context.document = document;

  const script = fs.readFileSync(path.join(root, 'script.py'), 'utf8');
  vm.runInContext(script, vm.createContext(context));

  input.value = 'premier';
  input.dispatchEvent({ type: 'input' });
  assert.equal(resultCount.textContent, '1');
  assert.equal(totalLeagues.textContent, '2');
  assert.equal(tableBody.children.length, 1);

  select.value = 'Highest Revenue';
  select.dispatchEvent({ type: 'change' });
  assert.equal(resultCount.textContent, '1');
  assert.equal(currentSort.textContent, 'Highest Revenue');

  input.value = '';
  input.dispatchEvent({ type: 'input' });
  assert.equal(resultCount.textContent, '2');
  assert.equal(tableBody.children.length, 2);
});
