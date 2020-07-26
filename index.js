import {
  Runtime,
  Inspector,
  Library,
} from '@observablehq/runtime';

const staticAttrs = ['url', 'name', 'class', 'style'];

class ObservablehqCell extends HTMLElement {
  constructor() {
    super();
    if (!this.name) {
      throw new Error('You have to specify a cell name');
    }
  }
  get name() {
    return this.getAttribute('name');
  }
  connectedCallback() {
    this.innerHTML = `<div class="wrapper"></div>`;
    if (!this.id) {
      this.slot = 'cell';
      if (this.name) {
        this.id = `observablehq-${this.name.replace(/\s/g, '-')}`;
      }
    }
  }
  static get template() {
    return false;
  }
  disconnectedCallback() {}
  adoptedCallback() {}
  disconnectedCallback() {}
}
customElements.define('o-cell', ObservablehqCell);

class ObservablehqNotebook extends HTMLElement {
  constructor() {
    super();
    // create initial template

    this.root = this.attachShadow({ mode: 'open' });
    this.root.innerHTML = `<style>
    :host {
      display: block;  /* or display: block; */
    }
    :host([hidden]) {
        display: none;
      }
    .wrapper {
      all: inherit;
    }
  </style>
  <div class="wrapper">
    <slot></slot>
    <slot name="cell"></slot>
  </div>
  `;

    this._wrapper = this.root.querySelector('.wrapper');
    // this._onSlotChange = this._onSlotChange.bind(this);
    this._cellSlot = this.root.querySelector('slot[name=cell]');

    // trigger event on news cells are added
    // this._cellSlot.addEventListener('slotchange', this._onSlotChange);
    this._cellsList = Array.from(this.querySelectorAll('o-cell'));
    if (!this.url) {
      throw new Error('The notebook name/url attribute is required ');
    }

    const attrs = this.getAttributeNames();
    this.attrsFiltered = attrs.filter((e) => !staticAttrs.includes(e)); //remove main attributes from list
    // this.injections =
    // custom runtime library, we will override width
    this.library = new Library();
    // if no custom width, then set it on resizeobserver from wrapper conatiner
    if (!this.injections.width) {
      this.library.width = this._customWidth();
    }
  }
  async _init() {
    // inspired by
    // https://observablehq.com/@mbostock/dataflow
    // https://observablehq.com/d/d0bb058f650143a9
    // load selected notebook definitions
    const { default: define } = await import(
      /^https:/.test(this.url)
        ? this.url
        : `https://api.observablehq.com/${this.url}.js?v=3`
    );
    // create runtime with or not custom library
    const runtime = new Runtime(this.library);

    // Create the main module, including any injected values.
    const main = runtime.module();
    for (const name in this.injections) {
      main.define(name, [], () => this.injections[name]);
    }
    const imported = runtime.module(define);
    this._notebook = imported.derive([...Object.keys(this.injections)], main);
    if (this.cell) {
      try {
        main
          .variable(new Inspector(this._wrapper))
          .import(this.cell, this._notebook);
      } catch (e) {
        console.error('cell name error', e);
      }
      return;
    }
    if (this._cellsList.length > 0) {
      try {
        this._cellsList.forEach((cell, i) => {
          const wrapper = cell.querySelector('.wrapper');
          main
            .variable(new Inspector(wrapper))
            .import(cell.name, this._notebook);
        });
      } catch (e) {
        console.error('cell name error', e);
      }
      return;
    }
    // mount the entire notebook if no cells slots or cell attribute is present
    new Runtime(this.library).module(define, Inspector.into(this._wrapper));
  }
  _customWidth() {
    return this.library.Generators.observe((change) => {
      let width = change(this._wrapper.clientWidth);
      function resized(entries) {
        for (const entry of entries) {
          let w = entry.contentRect.width;
          if (w !== width) change((width = w));
        }
      }
      const resizeObserver = new ResizeObserver(resized);
      resizeObserver.observe(this._wrapper);

      return function () {
        resizeObserver.unobserve(this._wrapper);
      };
    });
  }

  // attribute for notebook url
  get url() {
    return this.getAttribute('url');
  }
  // attribute for single cell name
  get cell() {
    return this.getAttribute('cell');
  }
  // attribute for injects, override notebook values
  get injections() {
    // getter parse string to JSON object
    const _injections = this.getAttribute('injections');
    return _injections ? JSON.parse(_injections) : {};
  }
  set injections(newValue) {
    // setter converts it back to string
    this.setAttribute('injections', JSON.stringify(newValue));
  }
  disconnectedCallback() {}
  static get observedAttributes() {
    return ['injections'];
  }

  // Fires when an attribute was added, removed, or updated
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'injections' && this._notebook) {
      // redefine value on attribute change!
      Object.entries(this.injections).forEach(([name, value]) => {
        console.log([name, value]);
        this._notebook.redefine(name, value);
      });
    }
  }

  // Fires when an element is moved to a new document
  adoptedCallback() {}

  connectedCallback() {
    customElements.whenDefined('o-cell').then((_) => this._init());
  }
  disconnectedCallback() {}
}
customElements.define('o-notebook', ObservablehqNotebook);
