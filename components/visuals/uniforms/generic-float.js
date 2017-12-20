/* global HTMLElementPlus */

class VJOTGFloatUniform extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['name', 'value'];
	}
	allAttributesChangedCallback(glAttributes) {
		// Fetch an existing uniform to update or create a new one
		const uniform = this.parentNode.uniforms[glAttributes.name] || {
			type: 'f'
		};
		uniform.value = glAttributes.value;

		this.parentNode.uniforms[glAttributes.name] = uniform;
		this.shaderChunks = {
			uniforms: `uniform float ${glAttributes.name};`
		};
	}
}

customElements.define('vj-otg-float-uniform', VJOTGFloatUniform);
export default VJOTGFloatUniform;