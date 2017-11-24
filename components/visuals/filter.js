'use strict';
/* global HTMLElementPlus, THREE */

function parseVector3(v3, str) {
	v3.set(...str.split(',').map(n => Number(n.trim())));
}

/**
 * Element for pieces of logic which transform the current Color (vec4)
 */
const filterTemplate = document.createElement('template');
filterTemplate.innerHTML = '<div style="display:none;"><slot></slot></div>';
class VJOTGFilter extends HTMLElementPlus {
	constructor() {
		super();
		this.constructor.filterCount = this.constructor.filterCount || 0;
		this.name = 'filter_id_' + this.constructor.filterCount++;
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(filterTemplate.content.cloneNode(true));
	}
	
	static glslFunction() {
		return `
			vec4 hslGradient(vec2 coord, int gradientDirection, vec3 gradientStart, vec3 gradientStop) {
			vec4 gradient = noopVec4; // 1,1,1,1
			if (gradientDirection != 0) {
				float gradientMixFactor = 1.0-coord.y;
				if (gradientDirection == 2) gradientMixFactor = length(coord - vec2(1.0, 1.0));
				if (gradientDirection == 3) gradientMixFactor = 1.0-coord.x;
				if (gradientDirection == 4) gradientMixFactor = length(coord - vec2(1.0, 0.0));
				if (gradientDirection == 5) gradientMixFactor = coord.y;
				if (gradientDirection == 6) gradientMixFactor = length(coord - vec2(0.0, 0.0));
				if (gradientDirection == 7) gradientMixFactor = coord.x;
				if (gradientDirection == 8) gradientMixFactor = length(coord - vec2(0.0, 1.0));
				gradient = vec4(hsl2rgb(mix(gradientStart, gradientStop, gradientMixFactor) * normaliseHSL), 1.0);
			}
			return gradient;
		}

		vec4 splitXTexture2D(sampler2D map, vec2 coord, float distance) {
			vec4 mapTexel1 = texture2D( map, vec2(coord.x + distance, coord.y));
			vec4 mapTexel2 = texture2D( map, vec2(coord.x -distance, coord.y));
			return (mapTexel1 + mapTexel2) / 2.0;
		}`;
	}

	allAttributesChangedCallback(glAttributes) {
		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		// If it has custom main script...
		const customMain = this.innerHTML.trim() || false;

		// If not in a valid parent then return
		if (!layerName) return;

		if (glAttributes.type === 'from-source') {
			const sourceIndexU = this.parentNode.uniforms[`${this.name}_sourceIndex`] || { type: 'i' };
			this.parentNode.uniforms[`${this.name}_sourceIndex`] = sourceIndexU;

			sourceIndexU.value = Number(glAttributes.source);

			this.shaderChunks = {
				uniforms: `uniform int ${this.name}_sourceIndex;`,
				main: `${layerName} *= getSource(${this.name}_sourceIndex, newUV);`
			};
		}

		if ( glAttributes.type === 'hsl-gradient' ) {
			const directionU = this.parentNode.uniforms[
				`${this.name}_gradientDirection`
			] || { type: 'i' };
			const startU = this.parentNode.uniforms[`${this.name}_gradientStart`] || {
				type: 'v3',
				value: new THREE.Vector3()
			};
			const stopU = this.parentNode.uniforms[`${this.name}_gradientStop`] || {
				type: 'v3',
				value: new THREE.Vector3()
			};

			this.parentNode.uniforms[`${this.name}_gradientDirection`] = directionU;
			this.parentNode.uniforms[`${this.name}_gradientStart`] = startU;
			this.parentNode.uniforms[`${this.name}_gradientStop`] = stopU;

			directionU.value = glAttributes.direction;
			parseVector3(startU.value, glAttributes.start);
			parseVector3(stopU.value, glAttributes.stop);

			let main;
			if (customMain) {
				main = customMain
					.replace('[layer]', layerName)
					.replace('[start]', `${this.name}_gradientStart`)
					.replace('[stop]', `${this.name}_gradientStop`)
					.replace('[direction]', `${this.name}_gradientDirection`);
			} else {
				main = `${layerName} *= hslGradient(newUV, ${
					this.name
				}_gradientDirection, ${this.name}_gradientStart, ${
					this.name
				}_gradientStop);`;
			}

			this.shaderChunks = {
				uniforms: `
					uniform int ${this.name}_gradientDirection;
					uniform vec3 ${this.name}_gradientStart;
					uniform vec3 ${this.name}_gradientStop;
				`,
				main: main
			};
		}

		if (glAttributes.type === 'main') {
			this.shaderChunks = {
				main: customMain.replace('[layer]', layerName)
			};
		}

		if (glAttributes.type === 'splitx') {
			const uniformName = `${this.name}_beatFuzzDistance`;

			glAttributes.size = Number(glAttributes.size);

			const beatFuzzSizeUniform = this.parentNode.uniforms[uniformName] || {
				type: 'f'
			};
			beatFuzzSizeUniform.value = glAttributes.size;
			this.parentNode.uniforms[uniformName] = beatFuzzSizeUniform;

			let main;
			if (customMain) {
				main = customMain
					.replace('[size]', uniformName)
					.replace('[layer]', layerName);
			} else {
				main = `${layerName} *= splitXTexture2D(map, newUV, ${uniformName});`;
			}

			this.shaderChunks = {
				uniforms: `uniform float ${uniformName};`,
				main: main
			};
		}
	}

	static get observedAttributes() {
		return [
			'value',
			'type',
			'start',
			'stop',
			'direction',
			'size',
			'name',
			'source'
		];
	}
}

customElements.define('vj-otg-filter', VJOTGFilter);