/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


import VJOTGFilter from '../prototype.js';

class VJOTGMirror extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			mode: 'i'
		};
	}

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.mode.uniform) {
			glAttributes.mode.uniform.value = glAttributes.mode.value;
		}
		this.shaderChunks.main = `
		
		int sym = ${
			glAttributes.mode.isSnippet ? glAttributes.mode.glslSnippet : glAttributes.mode.uniformName
		};
		
		if (sym == 1 || sym == 3) {
			if (newUV.x > 0.5) {
				newUV.x = 0.5 - (newUV.x - 0.5);
			}
		}
		if (sym == 2 || sym == 3) {
			if (newUV.y > 0.5) {
				newUV.y = 0.5 - (newUV.y - 0.5);
			}
		}`
	}
}

customElements.define('vj-otg-mirror', VJOTGMirror);
