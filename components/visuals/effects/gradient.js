
import VJOTGFilter from '../prototype.js';

function parseVector3(v3, str) {
	v3.set(...str.split(',').map(n => Number(n.trim())));
}

class VJOTGGradient extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			start: 'v3',
			stop: 'v3',
			direction: 'i'
		};
	}

	allAttributesChangedCallback(glAttributes) {

		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		// If not in a valid parent then return
		if (!layerName) return;

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
		}`;
	}
}

customElements.define('vj-otg-gradient', VJOTGGradient);
export default VJOTGGradient;