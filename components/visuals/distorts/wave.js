/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


import VJOTGFilter from '../prototype.js';

class VJOTGWave extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			speed: 'f',
			amplitude: 'f',
			frequency: 'f',
			t: 'f'
		};
	}

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.speed.uniform) {
			glAttributes.speed.uniform.value = glAttributes.speed.value;
		}
		if (glAttributes.frequency.uniform) {
			glAttributes.frequency.uniform.value = glAttributes.frequency.value;
		}
		if (glAttributes.t.uniform) {
			glAttributes.t.uniform.value = glAttributes.t.value;
		}
		if (glAttributes.amplitude.uniform) {
			glAttributes.amplitude.uniform.value = glAttributes.amplitude.value;
		}

		this.shaderChunks.main = `newUV = newUV + vec2(sin((vUv.y * (${
			glAttributes.frequency.isSnippet ? glAttributes.frequency.glslSnippet : glAttributes.frequency.uniformName
		}) + (${
			glAttributes.t.isSnippet ? glAttributes.t.glslSnippet : glAttributes.t.uniformName
		}) * (${
			glAttributes.speed.isSnippet ? glAttributes.speed.glslSnippet : glAttributes.speed.uniformName
		})) * PI) * (${
			glAttributes.amplitude.isSnippet ? glAttributes.amplitude.glslSnippet : glAttributes.amplitude.uniformName
		}), 0.0);`;
	}
}

customElements.define('vj-otg-wave', VJOTGWave);
