'use strict';
/* global HTMLElementPlus, THREE */

function parseVector3(v3, str) {
	v3.set(...str.split(',').map(n => Number(n.trim())));
}

const typeMap = {
	i: 'int',
	f: 'float',
	v3: 'vec3'
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
		this.shaderChunks = {
			uniforms: ''
		};
	}
	
	static get observedAttributes() {
		return [
			'type',
			'start', // For gradient
			'stop', // For Gradient
			'direction', // For Gradient
			'size', // For splitX
			'source' // For from-source
		];
	}

	static parseAttributeValue(name, value) {

		// Type is just a string so ignore it.
		if (name === 'type') return value;

		if (!value) return;

		value = value.trim();
		const literalTest = value.match(/^\[(.*)\]$/);
		const isSnippet = !!literalTest;

		if (isSnippet) {
			return {
				glslSnippet: literalTest[1],
				isSnippet: true
			}
		} else {

			let type;

			switch (name) {
			case 'start':
			case 'stop':
				type = 'v3';
				value=value;
				break;

			case 'direction':
			case 'source':
				value = Number(value);
				type = 'i';
				break;


			case 'size': 
				value = Number(value);
				type = 'f';
				break;
			}

			const uniformName = `${this.name}_${name}`;
			if (!this.parentNode.uniforms[uniformName]) {
				this.parentNode.uniforms[uniformName] = { type: type };
				this.shaderChunks.uniforms += `uniform ${typeMap[type]} ${uniformName};` + '\n';
			}

			const uniform = this.parentNode.uniforms[uniformName];
			this.parentNode.uniforms[uniformName] = uniform;
			if (type === 'v3' && !uniform.value) {
				uniform.value = new THREE.Vector3();
			}

			return {
				value: value,
				isSnippet: false,
				uniform: uniform,
				uniformName: uniformName
			}
		}
	}

	allAttributesChangedCallback(glAttributes) {

		console.log(glAttributes);

		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		// If it has custom main script...
		const customMain = this.innerHTML.trim() || false;

		// If not in a valid parent then return
		if (!layerName) return;

		if (
			glAttributes.type === 'from-source' &&
			glAttributes.source !== undefined
		) {
			// Update the uniform.
			if (glAttributes.source.uniform) {
				glAttributes.source.uniform.value = glAttributes.source.value;
			}

			// Set the main program
			if (glAttributes.source.isSnippet) {
				this.shaderChunks.main = `${layerName} *= getSource((${glAttributes.source.glslSnippet}), newUV);`
			} else {
				this.shaderChunks.main = `${layerName} *= getSource(${glAttributes.source.uniformName}, newUV);`
			}
		}

		if (
			glAttributes.type === 'hsl-gradient'
		) {

			// Update the uniform.
			if (glAttributes.direction.uniform) {
				glAttributes.direction.uniform.value = glAttributes.direction.value;
			}
			if (glAttributes.start.uniform) {
				parseVector3(glAttributes.start.uniform.value, glAttributes.start.value);
			}
			if (glAttributes.stop.uniform) {
				parseVector3(glAttributes.stop.uniform.value, glAttributes.stop.value);
			}

			// Set the main program
			let main = `${layerName} *= hslGradient(newUV, ${
				glAttributes.direction.isSnippet ? glAttributes.glslSnippet : glAttributes.direction.uniformName
			}, ${
				glAttributes.start.isSnippet ? glAttributes.start.glslSnippet : glAttributes.start.uniformName
			}, ${
				glAttributes.stop.isSnippet ? glAttributes.stop.glslSnippet : glAttributes.stop.uniformName
			});`;

			this.shaderChunks.main = main;
		}

		if (glAttributes.type === 'main') {
			// Set the main program
			this.shaderChunks = {
				main: customMain.replace('[layer]', layerName)
			};
		}

		if (
			glAttributes.type === 'splitx' &&
			glAttributes.size !== undefined
		) {
			// Update the uniform.
			if (glAttributes.size.uniform) {
				glAttributes.size.uniform.value = glAttributes.size.value;
			}

			if (glAttributes.size.isSnippet) {
				this.shaderChunks.main = `${layerName} *= splitXTexture2D(minnie, newUV, ${glAttributes.size.glslSnippet});`
			} else {
				this.shaderChunks.main = `${layerName} *= splitXTexture2D(minnie, newUV, ${glAttributes.size.uniformName});`
			}
		}
	}
	
	// This code gets added as a function in the code
	static glslFunction() {
		return `
		// From https://github.com/Jam3/glsl-hsl2rgb/blob/master/index.glsl
		// MIT License (MIT) Copyright (c) 2015 Jam3
		
		float hue2rgb(float f1, float f2, float hue) {
			if (hue < 0.0)
				hue += 1.0;
			else if (hue > 1.0)
				hue -= 1.0;
			float res;
			if ((6.0 * hue) < 1.0)
				res = f1 + (f2 - f1) * 6.0 * hue;
			else if ((2.0 * hue) < 1.0)
				res = f2;
			else if ((3.0 * hue) < 2.0)
				res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
			else
				res = f1;
			return res;
		}
		
		vec3 hsl2rgb(vec3 hsl) {
			vec3 rgb;
			
			if (hsl.y == 0.0) {
				rgb = vec3(hsl.z); // Luminance
			} else {
				float f2;
				
				if (hsl.z < 0.5)
					f2 = hsl.z * (1.0 + hsl.y);
				else
					f2 = hsl.z + hsl.y - hsl.y * hsl.z;
					
				float f1 = 2.0 * hsl.z - f2;
				
				rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
				rgb.g = hue2rgb(f1, f2, hsl.x);
				rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
			}   
			return rgb;
		}
		
		vec3 hsl2rgb(float h, float s, float l) {
			return hsl2rgb(vec3(h, s, l));
		}

		//  MIT License (MIT) Copyright (c) 2017 Ada Rose Cannon
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
		}
`;
	}
}

customElements.define('vj-otg-filter', VJOTGFilter);