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
		return ['type', 'src', 'name'];
	}
	allAttributesChangedCallback(glAttributes) {
		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		if (
			glAttributes.type === 'texture' &&
			glAttributes.src &&
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
				main: `${layerName} *= texture2D(${glAttributes.name}, newUV);`
			};
		}
	}
}

customElements.define('vj-otg-source', VJOTGSource);
