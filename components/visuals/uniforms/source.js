'use strict';
/* global HTMLElementPlus, THREE */

/**
 * @customelement vj-otg-source
 * @description 
 * Used for defining a special type of uniforms. Textures. 
 * These can be accessed using the texture sampler in the glsl code.
 * @property name {number} name of the variable in glsl
 * @property src {querySelector} element to use as texture, can be &lt;img&gt; or &lt;video&gt;
 * @property index {number} index for retrieving texture using getSource(index, coordinate); in the glsl code
 * @example <caption>Import an image, give it the name minnie.</caption>
 * <vj-otg-source-uniform src="#minnie" name="minnie" index="1"></vj-otg-source-uniform>
 * @example <caption>Use it in GLSL for a static texture.</caption>
 * gl_FragColor = texture2D(minnie, newUV);
 * @example <caption>Use it in GLSL for a dynamic texture.</caption>
 * gl_FragColor = getSource(1, newUV);
 */
class VJOTGSource extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['src', 'index', 'name'];
	}
	allAttributesChangedCallback(glAttributes) {

		if (
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