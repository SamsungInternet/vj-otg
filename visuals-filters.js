let filterCount = 0;

function parseVector3(str) {
	return new THREE.Vector3(...str.split(',').map(n => Number(n.trim())));
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
			this.glAttributes.type === 'source-video' &&
			this.glAttributes.value
		) {
			const video = this.parentNode.querySelector(this.glAttributes.value);
			window.addEventListener('click', () => video.play(), {
				once: true
			});
			const texture = new THREE.VideoTexture( video );
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.format = THREE.RGBFormat;

			const uniform = this.parentNode.uniforms.map || { type: 't' };
			uniform.value = texture;
			this.parentNode.uniforms.map = uniform;

			this.shaderChunks = {
				uniforms: 'uniform sampler2D map;'
			}
		}


		if (
			this.glAttributes.type === 'texture'
		) {
			if (customMain) {
				this.shaderChunks = {
					main: customMain.replace('[layer]', layerName)
				}
			} else {
				this.shaderChunks = {
					main: `${layerName} *= texture2D(map, newUV);`
				}
			}
		}

		if (
			this.glAttributes.type === 'gradient' &&
			this.glAttributes.start &&
			this.glAttributes.stop &&
			this.glAttributes.direction
		) {
			
			const directionU = this.parentNode.uniforms[`${this.name}_gradientDirection`] || { type: 'i'};
			const startU = this.parentNode.uniforms[`${this.name}_gradientStart`] || { type: 'v3' };
			const stopU = this.parentNode.uniforms[`${this.name}_gradientStop`] || { type: 'v3' };

			this.parentNode.uniforms[`${this.name}_gradientDirection`] = directionU;
			this.parentNode.uniforms[`${this.name}_gradientStart`] = startU;
			this.parentNode.uniforms[`${this.name}_gradientStop`] = stopU;

			directionU.value = this.glAttributes.direction;
			startU.value = parseVector3(this.glAttributes.start);
			stopU.value = parseVector3(this.glAttributes.stop);

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
			this.rafFn = function () {
				timeUniform.value = (Date.now() / 10000) % 1;
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
		'name'
	]; }
	attributeChangedCallback(attr, oldValue, newValue) {
		this.glAttributes[attr] = newValue;
		this.update();
	}
}

window.addEventListener('DOMContentLoaded', function () {
	customElements.define('vj-otg-filter', VJOTGFilter);
});
