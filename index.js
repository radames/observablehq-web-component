import { Runtime, Inspector, Library } from '@observablehq/runtime';

const staticAttrs = ['notebook', 'cell', 'class', 'style'];

class ObservablehqCell extends HTMLElement {
  constructor() {
    super();
    if (!this.notebook) {
      throw new Error('The notebook name/path attribute is required ');
    }

    const attrs = this.getAttributeNames();
    this.attrsFiltered = attrs.filter((e) => !staticAttrs.includes(e)); //remove main attributes from list
    // this.injections =

    this.root = this.attachShadow({ mode: 'open' });
    this.wrapper = document.createElement('div');

    this.root.innerHTML = `<style>
    :host {
      display: block;  /* or display: block; */
      with: 100%;
    }
    :host([hidden]) {
        display: none;
      }
  </style>`;

    this.root.appendChild(this.wrapper);

    // custom runtime library, we will override width
    this.library = new Library();
    // if no custom width, then set it on resizeobserver from wrapper conatiner
    if (!this.injections.width) {
      this.library.width = this.customWidth();
    }
    this.init();
  }
  async init() {
    // inspired by
    // https://observablehq.com/@mbostock/dataflow
    // https://observablehq.com/d/d0bb058f650143a9
    // load selected notebook definitions
    const { default: define } = await import(
      /^https:/.test(this.notebook)
        ? this.notebook
        : `https://api.observablehq.com/${this.notebook}.js?v=3`
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

    if (!this.cell) {
      new Runtime(this.library).module(define, Inspector.into(this.wrapper));
      return;
    }
    try {
      main
        .variable(new Inspector(this.wrapper))
        .import(this.cell, this._notebook);
    } catch (e) {
      console.error('cell name error', e);
    }
  }
  customWidth() {
    return this.library.Generators.observe((change) => {
      let width = change(this.wrapper.clientWidth);
      function resized(entries) {
        for (const entry of entries) {
          let w = entry.contentRect.width;
          if (w !== width) change((width = w));
        }
      }
      const resizeObserver = new ResizeObserver(resized);
      resizeObserver.observe(this.wrapper);

      return function () {
        resizeObserver.unobserve(this.wrapper);
      };
    });
  }

  get notebook() {
    return this.getAttribute('notebook');
  }
  get cell() {
    return this.getAttribute('cell');
  }
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
    // this.observeAttrChange(this, (name, value) => {
    //   // exit if attributeName is in the protected attrs list
    //   if (staticAttrs.includes(name)) return;
    //   // redefine value on attribute change!
    //   this._notebook.redefine(name, value);
    // });
  }
  disconnectedCallback() {}
}
customElements.define('o-cell', ObservablehqCell);
