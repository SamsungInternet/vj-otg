/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


import VJOTGFilter from '../prototype.js';

/**
 * @customelement vj-otg-zoom
 * @description Used to zoom and pan the current coordinate.
 * @property factor {number} how far to zoom in, 1.0 is normal, 0.5 is zoomed out 2.0 is zoomed in.
 * @property position {vector2} The place to zoom on, 0.5 0.5 is the center.
 * @example <caption>Zoom in 2x</caption>
 * <vj-otg-zoom factor="2" position="0.5, 0.5"></vj-otg-zoom>
 */
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
