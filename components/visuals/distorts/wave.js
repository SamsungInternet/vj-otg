/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


import VJOTGFilter from '../prototype.js';

/**
 * @customelement vj-otg-wave
 * @description Custom element for distorting the coordinate using a wave pattern.
 * @property t {number} time offset increase this to move the wave.
 * @property speed {number} how fast the waves travel affects `t`.
 * @property frequency {number} the amount of waves
 * @property amplitude {number} the size of the waves.
 * @example <caption>Create a continuous moving wave by using the time uniform in the t property.</caption>
 * <vj-otg-time-uniform></vj-otg-time-uniform>
 * <vj-otg-wave t="[time]" frequency="3.0" amplitude="0.05" speed="0.5"></vj-otg-wave>
 */
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
