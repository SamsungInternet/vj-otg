'use strict';
/* global HTMLElementPlus, THREE */

/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */

const translate = ['r', 'g', 'b', 'a'];
function objectToUniforms(prefix, obj, options) {
	options = options || {};
	let i = -1;
	const out = {};
	const keys = Object.keys(obj).filter(k => k !== 'type');
	keys.forEach(function(key) {
		const oldValue = obj[key];

		// We don't care about anything not defined.
		if (!oldValue) return;
		const temp = oldValue.match(/^\[(.*)\]$/);
		const isLiteral = !!temp;
		i++;
		if (isLiteral) {
			return (out[key] = {
				value: 0,
				name: '(' + temp[1] + ')',
				isLiteral: true
			});
		} else {
			if (options.vector) {
				return (out[key] = {
					name: prefix + '.' + translate[i],
					value: Number(oldValue)
				});
			} else {
				return (out[key] = {
					name: prefix + '_' + key,
					value: Number(oldValue)
				});
			}
		}
	});

	// Set the options.vector to the calculated values
	if (options.vector) {
		options.vector.set(...Object.keys(out).map(k => out[k].value));
	}
	return out;
}

class VJOTGDistort extends HTMLElementPlus {
	constructor() {
		super();
		this.constructor.filterCount = this.constructor.filterCount || 0;
		this.name = 'distort_id_' + this.constructor.filterCount++;
	}
	static glslFunction () {
		return `
		vec2 rotate2D(vec2 v, vec2 o, float a) {
			float s = sin(a);
			float c = cos(a);
			mat2 m = mat2(c, -s, s, c);
			return m * (v - o) + o;
		}`;
	}
	static get observedAttributes() {
		return [
			'type',
			'position',
			'factor',
			'frequency',
			'amplitude',
			'speed',
			't',
			'angle'
		];
	}
	allAttributesChangedCallback(glAttributes) {
		if (
			glAttributes.type === 'wave' &&
			glAttributes.speed &&
			glAttributes.amplitude &&
			glAttributes.frequency &&
			glAttributes.t
		) {
			const uniformName = `${this.name}_wave`;
			const wave = this.parentNode.uniforms[uniformName] || {
				type: 'v4',
				value: new THREE.Vector4()
			};
			this.parentNode.uniforms[uniformName] = wave;
			const parsed = objectToUniforms(uniformName, glAttributes, {
				vector: wave.value
			});
			this.shaderChunks = {
				uniforms: `uniform vec3 ${uniformName};`,
				main: `newUV = newUV + vec2(sin((vUv.y * ${parsed.frequency.name} + ${
					parsed.t.name
				} * ${parsed.speed.name}) * PI) * ${parsed.amplitude.name}, 0.0);`
			};
		}

		if (
			glAttributes.type === 'zoom' &&
			glAttributes.position &&
			glAttributes.factor
		) {
			const uniformName = `${this.name}_zoom`;
			const zoom = this.parentNode.uniforms[uniformName] || {
				type: 'v4',
				value: new THREE.Vector4()
			};
			this.parentNode.uniforms[uniformName] = zoom;

			const position = glAttributes.position.split(',').map(String.trim);
			delete glAttributes.position;
			glAttributes.positionX = position[0];
			glAttributes.positionY = position[1];

			const parsed = objectToUniforms(uniformName, glAttributes, {
				vector: zoom.value
			});

			this.shaderChunks = {
				uniforms: `uniform vec3 ${uniformName};`,
				main: `newUV = (newUV / ${parsed.factor.name}) - (vec2(0.5, 0.5) / ${
					parsed.factor.name
				}) + vec2(${parsed.positionX.name},${parsed.positionY.name});`
			};
		}

		if (glAttributes.type === 'rotate' && glAttributes.angle) {
			const uniformName = `${this.name}_rotate`;
			const parsed = objectToUniforms(uniformName, glAttributes);

			const angleUniform = this.parentNode.uniforms[parsed.angle.name] || {
				type: 'f'
			};
			this.parentNode.uniforms[parsed.angle.name] = angleUniform;
			angleUniform.value = parsed.angle.value;

			this.shaderChunks = {
				uniforms: parsed.angle.isLiteral
					? ''
					: `uniform float ${parsed.angle.name};`,
				main: `newUV = rotate2D(newUV, centerCoord, ${
					parsed.angle.name
				} * deg2rad);`
			};
		}
	}
}

customElements.define('vj-otg-distort', VJOTGDistort);
