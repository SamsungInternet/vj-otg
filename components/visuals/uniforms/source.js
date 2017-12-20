'use strict';
/* global HTMLElementPlus, THREE */

/**
 * Used for defining a special type of uniforms. Textures. 
 * These can be accessed using the texture sampler in the glsl code.
 */

class VJOTGSource extends HTMLElementPlus {
	constructor() {
		super();
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
				window.addEventListener('click', () => source.play());
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
			this.parentNode.dirty = true;

			this.shaderChunks = {
				uniforms: `uniform sampler2D ${glAttributes.name};`,
				source: `if (i == ${glAttributes.index}) return texture2D(${glAttributes.name}, uv);`
			};
		}
	}
}

customElements.define('vj-otg-source-uniform', VJOTGSource);
export default VJOTGSource;