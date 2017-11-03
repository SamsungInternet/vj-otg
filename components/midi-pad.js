// All from Ada's scripts
// Polyfill!
// <script src="https://cdn.rawgit.com/webcomponents/webcomponentsjs/edf84e6e/webcomponents-sd-ce.js"></script>

// Allow using ref to find an element
// class HTMLElementWithRefs extends HTMLElement {

//   constructor () {
//     super();
//     this.refs = new Proxy({}, {
//       get: this.__getFromShadowRoot.bind(this)
//     });
//   }
  
//   __getFromShadowRoot (target, name) {
//     return this.shadowRoot.querySelector('[ref="' + name + '"]');
//   }
// }

// <my-el><span>here</span></my-el>
  
const padTemplate = document.createElement('template');

padTemplate.innerHTML = `
  <style>
  .midi-control__group {
    padding:1.1em 5%;
  }
  .midi-control__label {
    display: block;
    margin-bottom:0.5em;
    font-size: 1.1em;
  }
  .midi-control__button--pad {
    display: block;
    width: 20vh; height: 20vh;
    margin: 0px auto;
    position: relative;
    cursor: pointer;
    background-color: #444;
    background-image:linear-gradient(0deg, #555, #444);
    border: 2px solid #444;
    border-radius: 2px;
  }
  </style>
  <div class="midi-control__group">
    <label class="midi-control__label" for="padEx" ref="label"><slot></slot></label>
    <button id="padEx" class="midi-control__button--pad" ref="input"></button>
  </div>
`;

class MidiPadController extends HTMLElementWithRefs {
  constructor() {
    super();
    
    this.tabIndex = 0;
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(padTemplate.content.cloneNode(true));

    /*A pad has two events, on down and on release*/
    // TODO: REFACTOR THE FUCK OUT OF THIS
    /* mouse down */
    this.refs.input.addEventListener('mousedown', () => {
      this.value = [this.channel,this.note];
      this.dispatchEvent(new CustomEvent('midiMsg', {value: this.value}));
    });
    /* touch down */
    this.refs.input.addEventListener('touchstart', () => {
      this.value = [this.channel,this.note];
      this.dispatchEvent(new CustomEvent('midiMsg', {value: this.value}));
    });

    /* mouse release */
    this.refs.input.addEventListener('mouseup', () => {
      this.value = [this.channel,this.note];
      this.dispatchEvent(new CustomEvent('midiMsg', {value: this.value}));
    });
    /* touch release */
    this.refs.input.addEventListener('touchend', () => {
      this.value = [this.channel,this.note];
      this.dispatchEvent(new CustomEvent('midiMsg', {value: this.value}));
    });

  }
  
  static get observedAttributes() { return ['channel', 'note']; }
  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr === 'note') {
      this.note = newValue;
    }

    if (attr === 'channel') {
      this.channel = newValue;
    }
  }
}

window.addEventListener('DOMContentLoaded', function () {
  customElements.define('midi-pad', MidiPadController);
});