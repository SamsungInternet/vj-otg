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
  
const toggleTemplate = document.createElement('template');

toggleTemplate.innerHTML = `
  <style>
  .midi-control__group {
    padding:1.1em 5%;
  }
  .midi-control__label {
    display: block;
    margin-bottom:0.5em;
  }
  .midi-control__button--pad {
    display: block;
    width: 20vmin; height: 20vmin;
    margin: 0px auto;
    position: relative;
    cursor: pointer;
    background-color: #444;
    border: 2px solid #444;
    border-radius: 2px;
  }
  .midi-control__button--pad[data-state="on"] {background-color:#ddd;}
  </style>
  <div class="midi-control__group">
    <label class="midi-control__label" for="padEx" ref="label"><slot></slot></label>
    <button id="padEx" class="midi-control__button--pad" ref="input" data-state="off"></button>
  </div>
`;

class MidiToggleController extends HTMLElementWithRefs {
  constructor() {
    super();
    
    this.tabIndex = 0;
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(toggleTemplate.content.cloneNode(true));

    /*A pad has two events, on down and on release*/
    // TODO: REFACTOR THE FUCK OUT OF THIS
    /* mouse down */
    this.refs.input.addEventListener('mousedown', () => {
      this.value = [this.channel,this.note];
      this.dispatchEvent(new CustomEvent('midiMsg', {value: this.value}));
      this.state === 'off' ? this.setAttribute('state', 'on') : this.setAttribute('state', 'off');
    });
    /* touch down */
    this.refs.input.addEventListener('touchstart', () => {
      this.value = [this.channel,this.note];
      this.dispatchEvent(new CustomEvent('midiMsg', {value: this.value}));
      this.state === 'off' ? this.setAttribute('state', 'on') : this.setAttribute('state', 'off');
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
  
  static get observedAttributes() { return ['channel', 'note', 'state']; }
  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr === 'note') {
      this.note = newValue;
    }

    if (attr === 'channel') {
      this.channel = newValue;
    }

    if (attr === 'state') {
      this.state = newValue;
      this.refs.input.dataset.state = newValue;
    }
  }
}

window.addEventListener('DOMContentLoaded', function () {
  customElements.define('midi-toggle', MidiToggleController);
});