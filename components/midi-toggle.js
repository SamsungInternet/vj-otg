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
    outline: 0;
    padding: 3vmin;
  }
  .midi-control__label {
    outline: 0;
    display: inline-block;
    box-sizing: border-box;
    margin: 0px auto;
  }
  .midi-control__button--pad {
    outline: 0;
    display: block;
    width: 20vmin; height: 20vmin;
    margin: 0px auto;
    position: relative;
    cursor: pointer;
    background-color: hsla(210, 25%, 98%, 1.0);
    background-image:linear-gradient(0deg, hsla(210, 25%, 96%, 1.0), hsla(210, 25%, 98%, 1.0));
    border: 6px solid;
    border-image: linear-gradient(120deg, hsla(272, 54%, 80%, 1.0), hsla(194, 49%, 66%, 1.0), hsla(150, 52%, 64%, 1.0)) 10;
    border-radius: 1px;
    box-shadow:
      0px 0px 0px 1px hsla(210, 25%, 98%, 1.0),
      1px 1px 6px 2px hsla(0, 0%, 35%, 0.5),
      inset 2px 2px 0px 2px #fff,
      inset -2px -2px 0px 2px hsla(210, 25%, 98%, 1.0)
    ;
  }
  .midi-control__button--pad[data-state="on"] {border-image: linear-gradient(120deg, hsla(272, 94%, 70%, 1.0), hsla(194, 89%, 56%, 1.0), hsla(150, 92%, 54%, 1.0)) 10;}
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
    this.message = {};

    /*A pad has two events, on down and on release*/
    // TODO: REFACTOR THE FUCK OUT OF THIS
    /* mouse down */
    this.refs.input.addEventListener('mousedown', () => {
      this.message.data = [parseInt(this.channel),parseInt(this.note)];
      this.dispatchEvent(new CustomEvent('midiMsg', {message: this.message}));
      this.state === 'off' ? this.setAttribute('state', 'on') : this.setAttribute('state', 'off');
    });
    /* touch down */
    this.refs.input.addEventListener('touchstart', () => {
      this.message.data = [parseInt(this.channel),parseInt(this.note)];
      this.dispatchEvent(new CustomEvent('midiMsg', {message: this.message}));
      this.state === 'off' ? this.setAttribute('state', 'on') : this.setAttribute('state', 'off');
    });

    /* mouse release */
    this.refs.input.addEventListener('mouseup', () => {
      this.message.data = [(parseInt(this.channel)-16),parseInt(this.note)];
      this.dispatchEvent(new CustomEvent('midiMsg', {message: this.message}));
    });
    /* touch release */
    this.refs.input.addEventListener('touchend', () => {
      this.message.data = [(parseInt(this.channel)-16),parseInt(this.note)];
      this.dispatchEvent(new CustomEvent('midiMsg', {message: this.message}));
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