/* global HTMLElementPlus */

class VJOTGUniformTime extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return [];
	}
	allAttributesChangedCallback() {
		const timeUniform = this.parentNode.uniforms.time || {
			type: 'f',
			value: 0
		};
		this.parentNode.uniforms.time = timeUniform;
		this.shaderChunks = {
			uniforms: 'uniform float time;'
		};
		const now = Date.now();
		this.rafFn = function() {
			timeUniform.value = (Date.now() - now) / 1000;
		};
	}
}

customElements.define('vj-otg-time-uniform', VJOTGUniformTime);
export default VJOTGUniformTime;