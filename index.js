// import { Runtime, Inspector, Library } from 'https://cdn.jsdelivr.net/npm/@observablehq/runtime@4.7.2/src/index.js' //@observablehq/runtime';

import {
  Runtime,
  Inspector,
  Library,
} from 'https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js';

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
    this._notebook = await this.importNotebook(this.notebook, this.injections);
    const generator = await this._notebook.cell(this.cell);
    if (!generator) return;

    try {
      const result = generator.next(); // yield generator
      const value = await result.value; // await cell value
      this.wrapper.appendChild(value); // append it to shadowelement root
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
  // from https://observablehq.com/@mbostock/dataflow
  // https://observablehq.com/d/d0bb058f650143a9
  importNotebook(
    notebookSpecifier, // e.g., "@d3/bar-chart"
    injections = {} // e.g., {data: [{name, value}, …]}
  ) {
    const promise = (async () => {
      // Create the main module, including any injected values.
      const runtime = new Runtime(this.library);
      const main = runtime.module();
      for (const name in injections) {
        main.define(name, [], () => injections[name]);
      }

      // Load the requested notebook’s definition as an ES module.
      const { default: define } = await import(
        /^https:/.test(notebookSpecifier)
          ? notebookSpecifier
          : `https://api.observablehq.com/${notebookSpecifier}.js?v=3`
      );

      // Create the imported notebook’s module, and then derive a module
      // from it to inject the desired values. (If there are none, then
      // this is basically a noop.)
      const imported = runtime.module(define);
      const derived = imported.derive([...Object.keys(injections)], main);
      // return full notebook if no cells are presented

      // In many cases the imported cell will only have a single value, but
      // we must use the most generic representation (an async generator) as
      // the imported cell may be an async generator, or may reference one.

      derived.cell = (cellName) => {
        if (!cellName) {
          const runtime = new Runtime(this.library).module(
            define,
            Inspector.into(this.wrapper)
          );
          return;
        }
        return this.library.Generators.observe((notify) => {
          // Create the primary variable with an observer that will report the
          // desired cell’s fulfilled or rejected values.
          console.log("testt")
          main
            .variable({
              fulfilled(value) {
                notify(value);
              },
              rejected(value) {
                notify(Promise.reject(value));
              },
            })
            .import(cellName, derived);

          // Lastly, when this generator is disposed, dispose the runtime to
          // ensure that any imported generators terminate.
          return () => runtime.dispose();
        });
      };

      return derived;
    })();
    promise.cell = (cellName) =>
      promise.then((notebook) => notebook.cell(cellName));
    return promise;
  }

  importCell(
    cellName, // e.g., "chart"
    notebookSpecifier, // e.g., "@d3/bar-chart"
    injections = {} // e.g., {data: [{name, value}, …]}
  ) {
    return this.importNotebook(notebookSpecifier, injections).cell(cellName);
  }
  // observeAttrChange(el, callback) {
  //   var observer = new MutationObserver((mutations) => {
  //     mutations.forEach((mutation) => {
  //       if (mutation.type === 'attributes') {
  //         let newVal = mutation.target.getAttribute(mutation.attributeName);
  //         callback(mutation.attributeName, newVal);
  //       }
  //     });
  //   });
  //   observer.observe(el, { attributes: true });
  //   return observer;
  // }
  // Fires when an instance was removed from the document
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
