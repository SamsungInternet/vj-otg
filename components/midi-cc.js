'use strict';
/* global HTMLElementPlus */

// Polyfill!
// <script src="https://cdn.rawgit.com/webcomponents/webcomponentsjs/edf84e6e/webcomponents-sd-ce.js"></script>

const containerTemplate = document.createElement('template');
containerTemplate.innerHTML = `
  <style>
  :host .midi-control__group {
    outline: 0;
    padding: 2vmin;
    display: grid;
    grid-template-columns: 20% 80%;
    align-items: center;
  }
  :host .midi-control__label {
    outline: 0;
    justify-self: center;
    display: inline-block;
    box-sizing: border-box;
  }
  :host .midi-control__input--slider,
  :host .midi-control__input--slider::-webkit-slider-thumblider-runnable-track,
  :host .midi-control__input--slider::-moz-range-track,
  :host .midi-control__input--slider::-ms-track {
    outline: 0;
    display: inline-block;
    margin: 21px auto;
    position: relative;
    height: 6px; width:100%;
    cursor: pointer;
    background-color: hsla(272, 94%, 70%, 1.0);
    background-image: linear-gradient(90deg, hsla(272, 94%, 70%, 1.0), hsla(194, 89%, 56%, 1.0), hsla(150, 92%, 54%, 1.0));
    /* border: 1px solid fuchsia; */
    border-radius: 2px;
    box-shadow:
      inset 1px 1px 1px hsla(0, 0%, 35%, 0.5),
      1px 1px 1px #fff;
    -webkit-appearance: none;
  }
  :host .midi-control__input--slider::-webkit-slider-thumb,
  :host .midi-control__input--slider::-moz-range-thumb,
  :host .midi-control__input--slider::-ms-thumb {
    -webkit-appearance: none;
    box-sizing: border-box;
    height: 42px;
    width: 24px;
    border: 2px solid;
    border-image: linear-gradient(120deg, hsla(272, 94%, 70%, 1.0), hsla(194, 89%, 56%, 1.0), hsla(150, 92%, 54%, 1.0)) 5;
    border-radius: 2px;
    background-color: hsla(210, 25%, 98%, 1.0);
    background-image:linear-gradient(0deg, hsla(210, 25%, 96%, 1.0), hsla(210, 25%, 98%, 1.0));
    box-shadow:
      1px 1px 4px 1px hsla(0, 0%, 35%, 0.4),
      inset 2px 2px 0px 2px #fff,
      inset -2px -2px 0px 2px hsla(210, 25%, 98%, 1.0)
    ;
  }
  </style>
  <div class="midi-control__group">
    <label class="midi-control__label" for="sliderEx" ref="label"><slot></slot></label>
    <input class="midi-control__input--slider" id="sliderEx" type="range" min="0" max="127" step="1" value="64" ref="input" />
  </div>
`;

if (window.ShadyCSS) {
	window.ShadyCSS.prepareTemplate(containerTemplate, 'midi-cc');
}

class MidiCCController extends HTMLElementPlus {
	constructor() {
		super();

		this.tabIndex = 0;
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(containerTemplate.content.cloneNode(true));
		this.message = {};
		this.message.type = 'cc';

		this.refs.input.addEventListener('input', () => {
			this.message.data = [parseInt(this.channel), parseInt(this.note), parseInt(this.refs.input.value)];
			this.emitEvent('midiMsg', this.message );
		});

	}

	static get observedAttributes() { return ['channel', 'note', 'value']; }
	attributeChangedCallback(attr, oldValue, newValue) {

		if (attr === 'value') {
			this.refs.input.value = newValue;
			this.refs.input.dispatchEvent(new CustomEvent('input'));
		}

		if (attr === 'note') {
			this.note = newValue;
		}

		if (attr === 'channel') {
			this.channel = newValue;
		}
	}
}

window.addEventListener('DOMContentLoaded', function () {
	customElements.define('midi-cc', MidiCCController);
});