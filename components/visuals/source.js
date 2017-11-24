'use strict';
/* global HTMLElementPlus, THREE */

/**
 * Used for defining a special type of uniforms. Textures. 
 * These can be accessed using the texture sampler in the glsl code.
 */

class VJOTGSource extends HTMLElementPlus {
	constructor() {
		super();
		this.constructor.filterCount = this.constructor.filterCount || 0;
		this.name = 'uniform_id_' + this.constructor.filterCount++;
	}
	static get observedAttributes() {
		return ['type', 'src', 'index', 'name'];
	}
	allAttributesChangedCallback(glAttributes) {

		if (
			glAttributes.type === 'texture' &&
			glAttributes.src &&
			glAttributes.index &&
			glAttributes.name
		) {
			const source = this.parentNode.querySelector(glAttributes.src);
			let texture;
			if (source.tagName === 'VIDEO') {
				window.addEventListener('click', () => source.play(), {
					once: true
				});
				texture = new THREE.VideoTexture(source);
			}
			if (source.tagName === 'IMG') {
				texture = new THREE.Texture(source);
				source.addEventListener('load', () => (texture.needsUpdate = true), {
					once: true
				});
			}
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.format = THREE.RGBFormat;

			const uniform = this.parentNode.uniforms[glAttributes.name] || {
				type: 't'
			};
			uniform.value = texture;
			this.parentNode.uniforms[glAttributes.name] = uniform;

			this.shaderChunks = {
				uniforms: `uniform sampler2D ${glAttributes.name};`,
				source: `if (i == ${glAttributes.index}) return texture2D(${glAttributes.name}, uv);`
			};
		}
	}
}

customElements.define('vj-otg-source', VJOTGSource);
