let filterCount = 0;

function parseVector3(v3, str) {
	v3.set(...str.split(',').map(n => Number(n.trim())));
}

const groupTemplate = document.createElement('template');
groupTemplate.innerHTML = '<slot></slot>';

class VJOTGGroup extends HTMLElementWithRefs {
	constructor () {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(groupTemplate.content.cloneNode(true));
		this.uniforms = this.parentNode.uniforms;
	}
	static get observedAttributes() { return [ 'name' ]; }
	attributeChangedCallback(attr, oldValue, newValue) {
		this.glLayerName = newValue;
		this.shaderChunks = {

			// Give this layer a Vector to write the effects to and reset the UV
			main: `vec4 ${this.glLayerName} = vec4(1.0, 1.0, 1.0, 1.0); newUV = vUv;`
		};
	}
}

class VJOTGFilter extends HTMLElementWithRefs {
	constructor () {
		super();
		this.name = 'filter_id_' + filterCount++;
		this.attachShadow({mode: 'open'});
		this.glAttributes = {};
	}

	update() {

		// If this is in the top layer then work on the Fragment directly
		const layerName = this.parentNode.tagName === 'VJ-OTG-VISUALS' ?
			'gl_FragColor' :
			this.parentNode.glLayerName; // Otherwise work on the parent layer.

		const customMain = this.innerHTML.trim() || false;

		// If not in a valid parent then return
		if (!layerName) return;

		if (
			this.glAttributes.type === 'source' &&
			this.glAttributes.value &&
			this.glAttributes.name
		) {
			const source = this.parentNode.querySelector(this.glAttributes.value);
			let texture;
			if (source.tagName === 'VIDEO') {
				window.addEventListener('click', () => source.play(), {
					once: true
				});
				texture = new THREE.VideoTexture( source );
			}
			if (source.tagName === 'IMG') {
				texture = new THREE.Texture( source );
				source.addEventListener('load', 
					() => texture.needsUpdate = true,
					{ once: true }
				);
			}
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.format = THREE.RGBFormat;

			const uniform = this.parentNode.uniforms[this.glAttributes.name] || { type: 't' };
			uniform.value = texture;
			this.parentNode.uniforms[this.glAttributes.name] = uniform;

			this.shaderChunks = {
				uniforms: `uniform sampler2D ${this.glAttributes.name};`
			}
		}
		
		if (
			this.glAttributes.type === 'distort:wave',
			this.glAttributes.speed &&
			this.glAttributes.amplitude && 
			this.glAttributes.frequency
		) {
			const uniformName = `${this.name}_wave`;
			const wave = this.parentNode.uniforms[uniformName] || { type: 'v3', value: new THREE.Vector3() };
			this.parentNode.uniforms[uniformName] = wave;
			wave.value.set(this.glAttributes.frequency, this.glAttributes.amplitude, this.glAttributes.speed);
			this.shaderChunks = {
				uniforms: `uniform vec3 ${uniformName};`,
				main: `newUV = newUV + vec2(sin((vUv.y * ${uniformName}.x + time * 2.0 * PI * ${uniformName}.z))*${uniformName}.y, 0.0);`
			}
		}

		if (
			this.glAttributes.type === 'distort:zoom',
			this.glAttributes.factor &&
			this.glAttributes.position
		) {
			const uniformName = `${this.name}_zoom`;
			const zoom = this.parentNode.uniforms[uniformName] || { type: 'v3', value: new THREE.Vector3() };
			this.parentNode.uniforms[uniformName] = zoom;
			parseVector3(zoom.value, this.glAttributes.position + ',' + this.glAttributes.factor);
			this.shaderChunks = {
				uniforms: `uniform vec3 ${uniformName};`,
				main: `newUV = (newUV / ${uniformName}.z) + vec2(0.5, 0.5) * ${uniformName}.z - ${uniformName}.xy;`
			}
		}


		if (
			this.glAttributes.type === 'texture',
			this.glAttributes.source
		) {
			if (customMain) {
				this.shaderChunks = {
					main: customMain.replace('[layer]', layerName)
				}
			} else {
				this.shaderChunks = {
					main: `${layerName} *= texture2D(${this.glAttributes.source}, newUV);`
				}
			}
		}

		if (
			this.glAttributes.type === 'hsl-gradient' &&
			this.glAttributes.start &&
			this.glAttributes.stop &&
			this.glAttributes.direction
		) {
			
			const directionU = this.parentNode.uniforms[`${this.name}_gradientDirection`] || { type: 'i'};
			const startU = this.parentNode.uniforms[`${this.name}_gradientStart`] || { type: 'v3', value: new THREE.Vector3() };
			const stopU = this.parentNode.uniforms[`${this.name}_gradientStop`] || { type: 'v3', value: new THREE.Vector3() };

			this.parentNode.uniforms[`${this.name}_gradientDirection`] = directionU;
			this.parentNode.uniforms[`${this.name}_gradientStart`] = startU;
			this.parentNode.uniforms[`${this.name}_gradientStop`] = stopU;

			directionU.value = this.glAttributes.direction;
			parseVector3(startU.value, this.glAttributes.start);
			parseVector3(stopU.value, this.glAttributes.stop);

			let main;
			if (customMain) {
				main = customMain
					.replace('[layer]', layerName)
					.replace('[start]', `${this.name}_gradientStart`)
					.replace('[stop]', `${this.name}_gradientStop`)
					.replace('[direction]', `${this.name}_gradientDirection`);
			} else {
				main = `${layerName} *= hslGradient(newUV, ${this.name}_gradientDirection, ${this.name}_gradientStart, ${this.name}_gradientStop);`;
			}

			this.shaderChunks = {
				uniforms: `
					uniform int ${this.name}_gradientDirection;
					uniform vec3 ${this.name}_gradientStart;
					uniform vec3 ${this.name}_gradientStop;
				`,
				main: main
			}
		}

		if (
			this.glAttributes.type === 'generic-uniform-float' && 
			this.glAttributes.name && 
			this.glAttributes.value
		) {

			// Fetch an existing uniform to update or create a new one
			const uniform = this.parentNode.uniforms[this.glAttributes.name] || { type: 'f' };
			uniform.value = this.glAttributes.value;

			this.parentNode.uniforms[this.glAttributes.name] = uniform;			
			this.shaderChunks = {
				uniforms: `uniform float ${this.glAttributes.name};`
			}
		}

		if ( this.glAttributes.type === 'beat-uniform' ) {


			// Fetch an existing uniform to update or create a new one
			const beatUniform = this.parentNode.uniforms.beat || { type: 'f', value: 0 };
			this.parentNode.uniforms.beat = beatUniform;
			this.triggerBeat = function () {
				beatUniform.value = 1.0;
			}
			this.shaderChunks = {
				uniforms: 'uniform float beat;'
			}
			this.rafFn = function () {
				beatUniform.value *= 0.9;
			}
		}
		
		if ( this.glAttributes.type === 'time-uniform' ) {
			const timeUniform = this.parentNode.uniforms.time || { type: 'f', value: 0 };
			this.parentNode.uniforms.time = timeUniform;
			this.shaderChunks = {
				uniforms: 'uniform float time;'
			}
			const now = Date.now();
			this.rafFn = function () {
				timeUniform.value = (Date.now() - now) / 1000;
			}
		}

		if (
			this.glAttributes.type === 'main'
		) {
			this.shaderChunks = {
				main: customMain.replace('[layer]', layerName)
			};
		}

		if (
			this.glAttributes.type === 'splitx' &&
			this.glAttributes.size
		) {

			const uniformName = `${this.name}_beatFuzzDistance`;

			this.glAttributes.size = Number(this.glAttributes.size);

			const beatFuzzSizeUniform = this.parentNode.uniforms[uniformName] || { type: 'f' };
			beatFuzzSizeUniform.value = this.glAttributes.size;
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
			}
		}
	}

	static get observedAttributes() { return [
		'value',
		'type',
		'start',
		'stop',
		'direction',
		'size',
		'name',
		'source',
		'position',
		'factor',
		'frequency',
		'amplitude',
		'speed'
	]; }
	attributeChangedCallback(attr, oldValue, newValue) {
		this.glAttributes[attr] = newValue;
		this.update();
	}
}

window.addEventListener('DOMContentLoaded', function () {
	customElements.define('vj-otg-group', VJOTGGroup);
	customElements.define('vj-otg-filter', VJOTGFilter);
});
