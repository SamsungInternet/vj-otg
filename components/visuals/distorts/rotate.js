/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


import VJOTGFilter from '../prototype.js';

class VJOTGRotate extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			angle: 'f'
		};
	}

	static glslFunction () {
		return `
		vec2 rotate2D(vec2 v, vec2 o, float a) {
			float s = sin(a);
			float c = cos(a);
			mat2 m = mat2(c, -s, s, c);
			return m * (v - o) + o;
		}`;
	}

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.angle.uniform) {
			glAttributes.angle.uniform.value = glAttributes.angle.value;
		}
		this.shaderChunks.main = `newUV = rotate2D(newUV, centerCoord, (${
			glAttributes.angle.isSnippet ? glAttributes.angle.glslSnippet : glAttributes.angle.uniformName
		}) * deg2rad);`
	}
}

customElements.define('vj-otg-rotate', VJOTGRotate);
