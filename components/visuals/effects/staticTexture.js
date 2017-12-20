
import VJOTGFilter from '../prototype.js';

class VJOTGStaticTexture extends VJOTGFilter {
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

		this.shaderChunks.main = `${layerName} *= texture2D(${glAttributes['source-name'].value}, newUV);`
	}
}

export default VJOTGStaticTexture;
customElements.define('vj-otg-static-texture', VJOTGStaticTexture);