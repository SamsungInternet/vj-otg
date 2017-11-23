'use strict';
/* global HTMLElementPlus, THREE */

function parseVector3(v3, str) {
	v3.set(...str.split(',').map(n => Number(n.trim())));
}

const groupTemplate = document.createElement('template');
groupTemplate.innerHTML = '<slot></slot>';

class VJOTGGroup extends HTMLElementPlus {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(groupTemplate.content.cloneNode(true));
		this.uniforms = this.parentNode.uniforms;
	}
	static get observedAttributes() {
		return ['name'];
	}
	attributeChangedCallback(attr, oldValue, newValue) {
		this.glLayerName = newValue;
		this.shaderChunks = {
			// Give this layer a Vector to write the effects to and reset the UV
			main: `vec4 ${this.glLayerName} = vec4(1.0, 1.0, 1.0, 1.0); newUV = vUv;`
		};
	}
}

/**
 * Just hides the contents.
 */
const assetsTemplate = document.createElement('template');
assetsTemplate.innerHTML = '<div style="display:none;"><slot></slot></div>';
class VJOTGAssets extends HTMLElementPlus {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(assetsTemplate.content.cloneNode(true));
	}
}

/**
 * Element for pieces of logic which transform the current Color (vec4)
 */
class VJOTGFilter extends HTMLElementPlus {
	constructor() {
		super();
		this.constructor.filterCount = this.constructor.filterCount || 0;
		this.name = 'filter_id_' + this.constructor.filterCount++;
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(assetsTemplate.content.cloneNode(true));
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

		if ((glAttributes.type === 'texture', glAttributes.source)) {
			if (customMain) {
				this.shaderChunks = {
					main: customMain.replace('[layer]', layerName)
				};
			} else {
				this.shaderChunks = {
					main: `${layerName} *= texture2D(${glAttributes.source}, newUV);`
				};
			}
		}

		if (
			glAttributes.type === 'hsl-gradient' &&
			glAttributes.start &&
			glAttributes.stop &&
			glAttributes.direction
		) {
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

		if (glAttributes.type === 'splitx' && glAttributes.size) {
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

window.addEventListener('DOMContentLoaded', function() {
	customElements.define('vj-otg-assets', VJOTGAssets);
	customElements.define('vj-otg-uniform', VJOTGUniform);
	customElements.define('vj-otg-group', VJOTGGroup);
	customElements.define('vj-otg-filter', VJOTGFilter);
	customElements.define('vj-otg-source', VJOTGSource);
	customElements.define('vj-otg-distort', VJOTGDistort);
});
