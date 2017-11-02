let filterCount = 0;

function parseVector3(str) {
	return new THREE.Vector3(...str.split(',').map(n => Number(n.trim())));
}

class VJOTGFilter extends HTMLElementWithRefs {
	constructor () {
		super();
		this.name = 'filter_id_' + filterCount++;
		this.glAttributes = {};
	}

	update() {
		if (
			this.glAttributes.type === 'source' &&
			this.glAttributes.value
		) {
			console.log('Making texture');
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

			this.parentNode.uniforms.map = { type: 't', value: texture };

			this.shaderChunks = {
				uniforms: 'uniform sampler2D map;'
			}
		}


		if (
			this.glAttributes.type === 'texture'
		) {
			this.shaderChunks = {
				main: this.glAttributes.main || 'texture2D(map, newUV)'
			}
		}

		if (
			this.glAttributes.type === 'gradient' &&
			this.glAttributes.start && this.glAttributes.stop && this.glAttributes.direction
		) {
			
			this.parentNode.uniforms[`${this.name}_gradientDirection`] = { type: 'i', value: this.glAttributes.direction };
			this.parentNode.uniforms[`${this.name}_gradientStart`] = { type: 'v3', value: parseVector3(this.glAttributes.start) };
			this.parentNode.uniforms[`${this.name}_gradientStop`] = { type: 'v3', value: parseVector3(this.glAttributes.stop) };
			this.shaderChunks = {
				uniforms: `
					uniform int ${this.name}_gradientDirection;
					uniform vec3 ${this.name}_gradientStart;
					uniform vec3 ${this.name}_gradientStop;
				`,
				main: (
					this.glAttributes.main &&
					this.glAttributes.main
						.replace('[start]', `${this.name}_gradientStart`)
						.replace('[stop]', `${this.name}_gradientStop`)
						.replace('[direction]', `${this.name}_gradientDirection`)
				) || `hslGradient(newUV, ${this.name}_gradientDirection, ${this.name}_gradientStart, ${this.name}_gradientStop)`
			}
		}

		if ( this.glAttributes.type === 'beat-uniform' ) {
			const beatUniform = { type: 'f', value: 0 };
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
			const timeUniform = { type: 'f', value: 0 };
			this.parentNode.uniforms.time = timeUniform;
			this.shaderChunks = {
				uniforms: 'uniform float time;'
			}
			this.rafFn = function () {
				timeUniform.value = (Date.now() / 10000) % 1;
			}
		}

		if (
			this.glAttributes.type === 'splitx' &&
			this.glAttributes.size
		) {
			this.glAttributes.size = Number(this.glAttributes.size);
			const beatFuzzDistance = { type: 'f', value: this.glAttributes.size };
			const uniformName = `${this.name}_beatFuzzDistance`;
			this.parentNode.uniforms[uniformName] = beatFuzzDistance;
			this.shaderChunks = {
				uniforms: `uniform float ${uniformName};`,
				main: (
					this.glAttributes.main &&
					this.glAttributes.main.replace('[size]', uniformName)
				) || `splitXTexture2D(map, newUV, ${uniformName})`
			}
		}
	}

	static get observedAttributes() { return [
		'listen-on',
		'value',
		'type',
		'start',
		'stop',
		'direction',
		'size',
		'main'
	]; }
	attributeChangedCallback(attr, oldValue, newValue) {
		this.glAttributes[attr] = newValue;
		this.update();
	}
}

window.addEventListener('DOMContentLoaded', function () {
	customElements.define('vj-otg-filter', VJOTGFilter);
});
