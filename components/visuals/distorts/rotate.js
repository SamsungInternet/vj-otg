/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


import VJOTGFilter from '../prototype.js';

/**
 * @customelement vj-otg-rotate
 * @description Custom element for rotating the current corrdinate.
 * @property angle {number} value from 360 degrees to zero for how much it is rotated
 * @example <caption>Normal Usage, rotate by 30 degrees.</caption>
 * <vj-otg-rotate angle="30"></vj-otg-rotate>
 * @example <caption>Spiral an image</caption>
 * <!-- calculate the distance from the center -->
 * <vj-otg-main>float distanceFromCenter = length(centerCoord - newUV);</vj-otg-main>
 *
 * <!-- rotate more when we are far from the center of the image. -->
 * <vj-otg-rotate angle="[distanceFromCenter * 1000.0]"></vj-otg-rotate>
 */
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
