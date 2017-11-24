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
  
const containerTemplate = document.createElement('template');

containerTemplate.innerHTML = `
  <style>
  .midi-control__group {
    padding:2vm;
  }
  .midi-control__label {
    display: inline-block;
    width: 30%;
  }
  .midi-control__input--slider,
  .midi-control__input--slider::-webkit-slider-thumblider-runnable-track {
    display: inline-block;
    margin: 0px auto;
    position: relative;
    height: 24px; width: 68%;
    cursor: pointer;
    background-color: black;
    background-image:linear-gradient(90deg, black, fuchsia);
    border: 1px solid fuchsia;
    border-radius: 2px;
    -webkit-appearance: none;
  }
  </style>
  <div class="midi-control__group">
    <label class="midi-control__label" for="sliderEx" ref="label"><slot></slot></label>
    <input class="midi-control__input--slider" id="sliderEx" type="range" min="0" max="127" step="1" value="64" ref="input" />
  </div>
`;

class MidiCCController extends HTMLElementWithRefs {
  constructor() {
    super();
    
    this.tabIndex = 0;
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(containerTemplate.content.cloneNode(true));

    // const midiEvent = new Event('midiMsg');

    this.refs.input.addEventListener('input', () => {
      this.value = [this.channel,this.refs.input.value];
      // change this name to be same as midi api
      this.dispatchEvent(new CustomEvent('midiMsg', {value: this.value}));

    });

  }
  
  static get observedAttributes() { return ['channel', 'value']; }
  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr === 'value') {
      this.refs.input.value = newValue;
    }

    if (attr === 'channel') {
      this.channel = newValue;
    }
  }
}

window.addEventListener('DOMContentLoaded', function () {
  customElements.define('midi-cc', MidiCCController);
});