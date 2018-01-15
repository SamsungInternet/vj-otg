import VJOTGFilter from '../prototype.js';

/**
 * @customelement vj-otg-mirror
 * @description Custom element for mirroring the current corrdinate.
 * @property mode {number} value from 0-3 describing how the mirror is done
 * - 0, No mirror
 * - 1, Left to Right
 * - 2, Top to Bottom
 * - 3, Left to Right and Top to Bottom
 * @example
 * <vj-otg-mirror mode="1"></vj-otg-mirror>
 */
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
