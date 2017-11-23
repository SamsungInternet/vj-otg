'use strict';
/* global HTMLElementPlus */

/**
 * Uniforms give us variables in the shader which we can edit live without needing
 * to recompile everything.
 */

class VJOTGUniform extends HTMLElementPlus {
	constructor() {
		super();
		this.constructor.filterCount = this.constructor.filterCount || 0;
		this.name = 'uniform_id_' + this.constructor.filterCount++;
	}
	static get observedAttributes() {
		return ['name', 'type', 'value'];
	}
	allAttributesChangedCallback(glAttributes) {
		if (
			glAttributes.type === 'generic-float' &&
			glAttributes.name &&
			glAttributes.value
		) {
			// Fetch an existing uniform to update or create a new one
			const uniform = this.parentNode.uniforms[glAttributes.name] || {
				type: 'f'
			};
			uniform.value = glAttributes.value;

			this.parentNode.uniforms[glAttributes.name] = uniform;
			this.shaderChunks = {
				uniforms: `uniform float ${glAttributes.name};`
			};
		}

		if (glAttributes.type === 'beat') {
			// Fetch an existing uniform to update or create a new one
			const beatUniform = this.parentNode.uniforms.beat || {
				type: 'f',
				value: 0
			};
			this.parentNode.uniforms.beat = beatUniform;
			this.triggerBeat = function() {
				beatUniform.value = 1.0;
			};
			this.shaderChunks = {
				uniforms: 'uniform float beat;'
			};
			this.rafFn = function() {
				beatUniform.value *= 0.9;
			};
		}

		if (glAttributes.type === 'time') {
			const timeUniform = this.parentNode.uniforms.time || {
				type: 'f',
				value: 0
			};
			this.parentNode.uniforms.time = timeUniform;
			this.shaderChunks = {
				uniforms: 'uniform float time;'
			};
			const now = Date.now();
			this.rafFn = function() {
				timeUniform.value = (Date.now() - now) / 1000;
			};
		}
	}
}

customElements.define('vj-otg-uniform', VJOTGUniform);
