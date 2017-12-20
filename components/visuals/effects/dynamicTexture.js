
import VJOTGFilter from '../prototype.js';

class VJOTGDynamicTexture extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			'source-name': 'static-string'
		};
	}

	allAttributesChangedCallback(glAttributes) {

		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		// If not in a valid parent then return
		if (!layerName) return;

		// Update the uniform.
		if (glAttributes['source-index'].uniform) {
			glAttributes['source-index'].uniform.value = glAttributes['source-index'].value;
		}

		// Set the main program
		if (glAttributes['source-index'].isSnippet) {
			this.shaderChunks.main = `${layerName} *= getSource((${glAttributes['source-index'].glslSnippet}), newUV);`
		} else {
			this.shaderChunks.main = `${layerName} *= getSource(${glAttributes['source-index'].uniformName}, newUV);`
		}
	}
}

customElements.define('vj-otg-dynamic-texture', VJOTGDynamicTexture);
export default VJOTGDynamicTexture;