/* global HTMLElementPlus */

class VJOTGMidiUniform extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['name', 'midi-el'];
	}
	allAttributesChangedCallback(glAttributes) {
		
		const uniform = this.parentNode.uniforms[glAttributes.name] || {
			type: 'f',
			value: 0
		};

		if (this.__listeningToEl) {
			this.__listeningToEl.removeEventListener('midiMsg', this.__listenerFn);
		}

		this.__listeningToEl = document.querySelector(glAttributes['midi-el']);

		if (!this.__listeningToEl) throw Error('No element found with selector: ' + glAttributes['midi-el']);
		this.__listenerFn = function (e) {
			uniform.value = e.detail.data[2] / 127;
		};
		this.__listeningToEl.addEventListener('midiMsg', this.__listenerFn);

		this.parentNode.uniforms[glAttributes.name] = uniform;
		this.shaderChunks = {
			uniforms: `uniform float ${glAttributes.name};`
		};
	}
}

customElements.define('vj-otg-midi-uniform', VJOTGMidiUniform);
export default VJOTGMidiUniform