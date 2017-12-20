/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


import VJOTGFilter from '../prototype.js';

class VJOTGZoom extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			position: 'v2',
			factor: 'f'
		};
	}

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.position.uniform) {
			glAttributes.position.uniform.value.set.apply(
				glAttributes.position.uniform.value,
				glAttributes.position.value.split(',')
			);
		}
		if (glAttributes.factor.uniform) {
			glAttributes.factor.uniform.value = glAttributes.factor.value;
		}
		this.shaderChunks.main = `newUV = (newUV / (${
			glAttributes.factor.isSnippet ? glAttributes.factor.glslSnippet : glAttributes.factor.uniformName
		})) - (vec2(0.5, 0.5) / (${
			glAttributes.factor.isSnippet ? glAttributes.factor.glslSnippet : glAttributes.factor.uniformName
		})) + (${
			glAttributes.position.isSnippet ? glAttributes.position.glslSnippet : glAttributes.position.uniformName
		});`
	}
}

customElements.define('vj-otg-zoom', VJOTGZoom);
