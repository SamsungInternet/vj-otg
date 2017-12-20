
import VJOTGFilter from '../prototype.js';

class VJOTGSplitX extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			size: 'f',
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
		if (glAttributes.size.uniform) {
			glAttributes.size.uniform.value = glAttributes.size.value;
		}

		if (glAttributes.size.isSnippet) {
			this.shaderChunks.main = `${layerName} *= splitXTexture2D(${glAttributes['source-name'].value}, newUV, ${glAttributes.size.glslSnippet});`
		} else {
			this.shaderChunks.main = `${layerName} *= splitXTexture2D(${glAttributes['source-name'].value}, newUV, ${glAttributes.size.uniformName});`
		}
	}
	
	// This code gets added as a function in the code
	static glslFunction() {
		return `
			vec4 splitXTexture2D(sampler2D map, vec2 coord, float distance) {
				vec4 mapTexel1 = texture2D( map, vec2(coord.x + distance, coord.y));
				vec4 mapTexel2 = texture2D( map, vec2(coord.x -distance, coord.y));
				return (mapTexel1 + mapTexel2) / 2.0;
			}`;
	}
}

customElements.define('vj-otg-splitx', VJOTGSplitX);
export default VJOTGSplitX;