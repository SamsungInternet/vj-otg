/* global HTMLElementPlus */

/**
 * Provides VJ-OTG-Group used for changing what vj-otg-filter is applied to
 * Allowing us to effectively group effects.
 */

const groupTemplate = document.createElement('template');
groupTemplate.innerHTML = '<slot></slot>';

class VJOTGGroup extends HTMLElementPlus {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(groupTemplate.content.cloneNode(true));
		this.uniforms = this.parentNode.uniforms;
	}
	static get observedAttributes() {
		return ['name'];
	}
	attributeChangedCallback(attr, oldValue, newValue) {
		this.glLayerName = newValue;
		this.shaderChunks = {
			// Give this layer a Vector to write the effects to and reset the UV
			main: `vec4 ${this.glLayerName} = vec4(1.0, 1.0, 1.0, 1.0); newUV = vUv;`
		};
	}
}

customElements.define('vj-otg-group', VJOTGGroup);
export default VJOTGGroup;