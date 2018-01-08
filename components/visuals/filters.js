(function () {
'use strict';


	/* eslint-disable */
	/* THIS IS AN AUTOMATICALLY GENERATED FILE CHANGES WILL NOT BE PRESERVED */
	

/* global THREE, Detector, HTMLElementPlus */
const w = 480;
const h = 320;

function toggleFullScreen(el) {
	const doc = window.document;
	el = el || doc.documentElement;

	const requestFullScreen = el.requestFullscreen || el.mozRequestFullScreen || el.webkitRequestFullScreen || el.msRequestFullscreen;
	const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

	if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
	  requestFullScreen.call(el);
	}
	else {
	  cancelFullScreen.call(doc);
	}
}

const vjOTGVisuals = document.createElement('template');
vjOTGVisuals.innerHTML = `
	<style>
	vj-otg-assets {
		display: none;
	}
	:host {
		width: 100%;
		height: 100%;
		position: relative;
		display: block;
	}
	:host:-webkit-full-screen {
		width: 100vw;
		height: 100vh;
	}
	:host button[ref="fullscreenbtn"] {
		position: absolute;
		bottom: 1em; right: 1em;
		padding: 1em;
		border: 2px solid;
    	border-image: linear-gradient(120deg, hsla(272, 94%, 70%, 1.0), hsla(194, 89%, 56%, 1.0), hsla(150, 92%, 54%, 1.0)) 5;
    	border-radius: 2px;
    	background-color: hsla(210, 25%, 98%, 1.0);
    	background-image:linear-gradient(0deg, hsla(210, 25%, 96%, 1.0), hsla(210, 25%, 98%, 1.0));
	}
	</style>
	<slot></slot>
	<button ref="fullscreenbtn">Go Fullscreen</button>
`;

if (window.ShadyCSS) {
	window.ShadyCSS.prepareTemplate(vjOTGVisuals, 'vj-otg-visuals');
}

const glslFunctionSet = new Set();

class VJOTGVisuals extends HTMLElementPlus {
	constructor() {
		super();
		this.uniforms = {};

		this.tabIndex = 0;
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(vjOTGVisuals.content.cloneNode(true));

		if (!Detector.webgl) {
			Detector.addGetWebGLMessage();
			return true;
		}
		const renderer = new THREE.WebGLRenderer({
			antialias: false,
			preserveDrawingBuffer: false
		});
		renderer.setClearColor(0xbbbbbb);
		renderer.setSize(480, 320);
		this.shadowRoot.appendChild(renderer.domElement);

		this.shadowRoot.appendChild(this.refs.fullscreenbtn);
		this.refs.fullscreenbtn.addEventListener('click', () => toggleFullScreen(this));

		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		renderer.domElement.style.objectFit = 'cover';

		//            WEBGL
		// ---------------------------

		// create a scene
		const scene = new THREE.Scene();

		// put a camera in the scene
		const cameraH = 3;
		const cameraW = cameraH / h * w;
		const camera = new THREE.OrthographicCamera(
			-cameraW / 2,
			+cameraW / 2,
			cameraH / 2,
			-cameraH / 2,
			-10000,
			10000
		);
		camera.position.set(0, 0, 5);
		scene.add(camera);

		const light = new THREE.AmbientLight(Math.random() * 0xffffff);
		scene.add(light);

		const geometry = new THREE.PlaneGeometry(cameraW, cameraH);

		this.dirty = true;
		const material = new THREE.MeshBasicMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
		scene.add(this.mesh);

		// animation loop
		this.i = 0;

		this.__animate = this.__animate.bind(this);
		this.__renderer = renderer;
		this.__scene = scene;
		this.__camera = camera;
		requestAnimationFrame(this.__animate);
	}

	__animate() {
		requestAnimationFrame(this.__animate);

		if (this.dirty) {
			this.mesh.material = this.generateShader();
			this.dirty = false;
		}

		const material = this.mesh.material;

		for (const el of this.children) {
			if (el.rafFn) el.rafFn();
		}

		material.needsUpdate = true;
		this.__render();
	}

	generateShader() {

		const chunks = Array.from(this.querySelectorAll('*')).filter(el => el.tagName.match(/^vj-otg-/i))
			.map(el => {
				if (el.constructor.glslFunction) {
					glslFunctionSet.add(el.constructor.glslFunction());
				}
				return el.shaderChunks
			})
			.filter(chunk => !!chunk);

		const source = chunks
			.map(a => a.source)
			.filter(chunk => !!chunk)
			.join('\n\t');

		const sourceFn = `
vec4 getSource(int i, vec2 uv) {
	${source}
}
		`;
		const uniforms = chunks
			.map(a => a.uniforms)
			.filter(chunk => !!chunk)
			.join('\n');
		const main = chunks
			.map(a => a.main)
			.filter(chunk => !!chunk)
			.join('\n\n			');

		const fragmentShader =
			`
			#define USE_MAP true
			varying vec2 vUv;

			// Constants for Maths
			const float PI = 3.1415926535897932384626433832795;
			const float deg2rad = PI/180.0;
			const vec2 centerCoord = vec2(0.5, 0.5);
			const vec3 normaliseHSL = vec3(1.0/360.0, 1.0, 1.0);
			const vec3 noopVec3 = vec3(1.0, 1.0, 1.0);
			const vec4 noopVec4 = vec4(1.0, 1.0, 1.0, 1.0);

			// Uniforms
		` +
			uniforms +
			sourceFn +
			Array.from(glslFunctionSet).join('\n\n') +
			shaderChunks.noise +
			`
			void main() {

				// Change this to skew or warp the texture
				vec2 newUV = vUv + vec2(0.0, 0.0);

				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				` +
			main +
			`
			}
		`;

		fragmentShader
			.split('\n')
			.map((l, i) => console.log(i + 101 + ': ' + l));

		return new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,
			fragmentShader: fragmentShader
		});
	}

	// render the scene
	__render() {
		this.__renderer.render(this.__scene, this.__camera);
	}
}

const shaderChunks = {};

shaderChunks.noise = `
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
	return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
	return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
	const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
	const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

	// First corner
	vec3 i  = floor(v + dot(v, C.yyy) );
	vec3 x0 =   v - i + dot(i, C.xxx) ;

	// Other corners
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min( g.xyz, l.zxy );
	vec3 i2 = max( g.xyz, l.zxy );

	//   x0 = x0 - 0.0 + 0.0 * C.xxx;
	//   x1 = x0 - i1  + 1.0 * C.xxx;
	//   x2 = x0 - i2  + 2.0 * C.xxx;
	//   x3 = x0 - 1.0 + 3.0 * C.xxx;
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
	vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

	// Permutations
	i = mod289(i);
	vec4 p = permute( permute( permute(
	i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
	+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
	+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

	// Gradients: 7x7 points over a square, mapped onto an octahedron.
	// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
	float n_ = 0.142857142857; // 1.0/7.0
	vec3  ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

	vec4 x = x_ *ns.x + ns.yyyy;
	vec4 y = y_ *ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4( x.xy, y.xy );
	vec4 b1 = vec4( x.zw, y.zw );

	//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
	//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
	vec4 s0 = floor(b0)*2.0 + 1.0;
	vec4 s1 = floor(b1)*2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
	vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

	vec3 p0 = vec3(a0.xy,h.x);
	vec3 p1 = vec3(a0.zw,h.y);
	vec3 p2 = vec3(a1.xy,h.z);
	vec3 p3 = vec3(a1.zw,h.w);

	//Normalise gradients
	vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	// Mix final noise value
	vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
	m = m * m;
	return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
		dot(p2,x2), dot(p3,x3) ) );
}
`;

customElements.define('vj-otg-visuals', VJOTGVisuals);

/* global HTMLElementPlus */

/**
 * Used for storing images and videos to be referenced later
 */

const assetTemplate = document.createElement('template');
assetTemplate.innerHTML = '<slot></slot>';

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

customElements.define('vj-otg-assets', VJOTGAssets);

/* global HTMLElementPlus */

/**
 * Provides VJ-OTG-Group used for changing what vj-otg-filter is applied to
 * Allowing us to effectively group effects.
 */

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

customElements.define('vj-otg-group', VJOTGGroup);

/* global HTMLElementPlus, THREE */

/**
 * Used for defining a special type of uniforms. Textures. 
 * These can be accessed using the texture sampler in the glsl code.
 */

class VJOTGSource extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['type', 'src', 'index', 'name'];
	}
	allAttributesChangedCallback(glAttributes) {

		if (
			glAttributes.type === 'texture' &&
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

/* global HTMLElementPlus */

class VJOTGMidiUniform extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['name', 'midi-el'];
	}
	allAttributesChangedCallback(glAttributes) {
		
		const uniform = this.parentNode.uniforms[glAttributes.name] || {
			type: 'f',
			value: 0
		};

		if (this.__listeningToEl) {
			this.__listeningToEl.removeEventListener('midiMsg', this.__listenerFn);
		}

		this.__listeningToEl = document.querySelector(glAttributes['midi-el']);

		if (!this.__listeningToEl) throw Error('No element found with selector: ' + glAttributes['midi-el']);
		this.__listenerFn = function (e) {
			uniform.value = e.detail.data[2] / 127;
		};
		this.__listeningToEl.addEventListener('midiMsg', this.__listenerFn);

		this.parentNode.uniforms[glAttributes.name] = uniform;
		this.shaderChunks = {
			uniforms: `uniform float ${glAttributes.name};`
		};
	}
}

customElements.define('vj-otg-midi-uniform', VJOTGMidiUniform);

/* global HTMLElementPlus */

class VJOTGUniformTime extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return [];
	}
	allAttributesChangedCallback() {
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

customElements.define('vj-otg-time-uniform', VJOTGUniformTime);

/* global HTMLElementPlus */


// Exposes a beat uniform and an analyser uniform for use in the shader
// fires a 'beat' event each time a beat is triggered in the audio input

/**
 * Required params: Threshold
 */

class VJOTAnalyserUniform extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['threshold'];
	}
	allAttributesChangedCallback(glAttributes) {

		glAttributes.threshold = glAttributes.threshold || 64;

		const fftSize = 4096;
		const cutoff = 682; // Cut off high freq maximum is fftSize/2
		const finalSize = 20; // Number of bins in the histogram

		this.shaderChunks = {
			uniforms: `
				uniform float beat;
				uniform float analyser[${finalSize}];
				const float noAnalyserBins = ${finalSize.toFixed(1)};`
		};

		// Fetch an existing uniform to update or create a new one
		const beatUniform = this.parentNode.uniforms.beat || {
			type: 'f',
			value: 0
		};
		this.parentNode.uniforms.beat = beatUniform;

		// Fetch an existing uniform to update or create a new one
		const analyserUniform = this.parentNode.uniforms.analyser || {
			type: 'uFloatArray'
		};
		this.parentNode.uniforms.analyser = analyserUniform;

		// If this has already been setup then update the threshold and return
		if (this.threshold) {
			this.threshold = glAttributes.threshold;
			return;
		}

		this.threshold = glAttributes.threshold || 127; // our threshold value
		const base = 2; // Base for the power function, higher means larger groups at higher frequencies.
		const data = new Uint8Array(fftSize / 2); // Bins in for analyser node
		const processedData = new Float32Array(finalSize); // Our bins for post processed data
		let beat = 0; // our beat value
		const audioCtx = new window.AudioContext();
		const analyserNode = audioCtx.createAnalyser();
		analyserNode.fftSize = fftSize;
		const beatEvent = new Event('beat');

		analyserUniform.value = processedData;

		const binPattern = (function(inAmount, target) {
			let val = 1;
			let step = 1;
			let result;
			while (result !== target) {
				result = getBins(val).length;
				if (result < target) {
					// console.log('too big', val, result);
					step = step / 2;
					val -= step;
				} else if (result > target) {
					// console.log('too small', val, result);
					val += step;
				}
			}

			function getBins(k) {
				const a = [];
				let t = 0;
				let i = 0;
				while (t < inAmount) {
					t += Math.pow(base, k * i++);
					a.push(
						(a[a.length - 1] || 0) + Math.round(Math.pow(base, k * i++))
					);
				}
				return a;
			}

			return getBins(val);
		}(cutoff, finalSize));

		// fetches audio atream and returns analysed data
		function getStreamData() {
			// pipe in analysing to getUserMedia
			return navigator.mediaDevices
				.getUserMedia({ audio: true, video: false })
				.then(stream => audioCtx.createMediaStreamSource(stream))
				.then(source => {
					source.connect(analyserNode);
				});
		}

		getStreamData().then(() => {
			this.rafFn = function() {
				beatUniform.value *= 0.9;

				analyserNode.getByteFrequencyData(data);

				// put data into processed data using binPattern
				// First index needs to be one for the special case
				// i=0 where the initial value is 0.
				let index = 1;
				let sum = data[0];
				let binSize = 0;

				// binPattern is the index value of the next cutoff
				// for each item in frequency data (up to how many we actually want)
				for (let i = 0; i < cutoff; i++) {
					sum += data[i];

					if (i >= binPattern[index]) {
						binSize = binPattern[index] - binPattern[index - 1];
						sum = sum / binSize;
						processedData[index] = sum / 256; // Normalised so between 0 and 1
						sum = 0;
						index++;
					}
				}

				// get average
				let avSum = processedData.reduce(function(a, b) {
					return a + b;
				});

				beat = 256 * avSum / finalSize;

				if (beat > this.threshold) {
					// Dispatch the event.
					beatUniform.value = 1.0;
					this.dispatchEvent(beatEvent);
				}
			};
		});
	}
}

customElements.define('vj-otg-audio-uniform', VJOTAnalyserUniform);

/* global HTMLElementPlus */

class VJOTGFloatUniform extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['name', 'value'];
	}
	allAttributesChangedCallback(glAttributes) {
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
}

customElements.define('vj-otg-float-uniform', VJOTGFloatUniform);

/* global HTMLElementPlus, THREE */

const typeMap = {
	i: 'int',
	f: 'float',
	v2: 'vec2',
	v3: 'vec3',
	v4: 'vec4'
};

/* ##################################

	Prototype for all Filter

################################## */


class VJOTGFilter extends HTMLElementPlus {
	constructor() {
		super();
		this.constructor.filterCount = this.constructor.filterCount || 0;
		this.name = this.tagName.toLowerCase().replace(/[^a-z]/ig, '_') + '_' + this.constructor.filterCount++;
		this.shaderChunks = this.shaderChunks || {
			uniforms: ''
		};
	}
	
	static get observedAttributes() {

		// Populated with the format of each element
		return this.types ? Object.keys(this.types) : [];
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

			const type = this.constructor.types[name];

			switch (type) {
			case 'v2':
			case 'v3':
			case 'v4':
				value=value;
				break;

			case 'i':
				value = Number(value);
				break;

			case 'f': 
				value = Number(value);
				break;
				
			case 'static-string':
				return {
					value: value,
					isSnippet: false,
				};
			}

			const uniformName = `${this.name}_${name}`;

			if (!this.parentNode.uniforms[uniformName]) {
				this.parentNode.uniforms[uniformName] = { type: type };
				this.shaderChunks.uniforms += `uniform ${typeMap[type]} ${uniformName};` + '\n';
			}

			const uniform = this.parentNode.uniforms[uniformName];
			this.parentNode.uniforms[uniformName] = uniform;
			
			if (type === 'v2' && !uniform.value) {
				uniform.value = new THREE.Vector2();
			}

			if (type === 'v3' && !uniform.value) {
				uniform.value = new THREE.Vector3();
			}

			if (type === 'v4' && !uniform.value) {
				uniform.value = new THREE.Vector4();
			}

			return {
				value: value,
				isSnippet: false,
				uniform: uniform,
				uniformName: uniformName
			}
		}
	}
}

class VJOTGDynamicTexture extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			'source-name': 'static-string'
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
		if (glAttributes['source-index'].uniform) {
			glAttributes['source-index'].uniform.value = glAttributes['source-index'].value;
		}

		// Set the main program
		if (glAttributes['source-index'].isSnippet) {
			this.shaderChunks.main = `${layerName} *= getSource((${glAttributes['source-index'].glslSnippet}), newUV);`;
		} else {
			this.shaderChunks.main = `${layerName} *= getSource(${glAttributes['source-index'].uniformName}, newUV);`;
		}
	}
}

customElements.define('vj-otg-dynamic-texture', VJOTGDynamicTexture);

class VJOTGStaticTexture extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			'source-name': 'static-string'
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

		this.shaderChunks.main = `${layerName} *= texture2D(${glAttributes['source-name'].value}, newUV);`;
	}
}

customElements.define('vj-otg-static-texture', VJOTGStaticTexture);

class VJOTGSplitX extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			size: 'f',
			'source-name': 'static-string'
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
		if (glAttributes.size.uniform) {
			glAttributes.size.uniform.value = glAttributes.size.value;
		}

		if (glAttributes.size.isSnippet) {
			this.shaderChunks.main = `${layerName} *= splitXTexture2D(${glAttributes['source-name'].value}, newUV, ${glAttributes.size.glslSnippet});`;
		} else {
			this.shaderChunks.main = `${layerName} *= splitXTexture2D(${glAttributes['source-name'].value}, newUV, ${glAttributes.size.uniformName});`;
		}
	}
	
	// This code gets added as a function in the code
	static glslFunction() {
		return `
			vec4 splitXTexture2D(sampler2D map, vec2 coord, float distance) {
				vec4 mapTexel1 = texture2D( map, vec2(coord.x + distance, coord.y));
				vec4 mapTexel2 = texture2D( map, vec2(coord.x -distance, coord.y));
				return (mapTexel1 + mapTexel2) / 2.0;
			}`;
	}
}

customElements.define('vj-otg-splitx', VJOTGSplitX);

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

const filterTemplate = document.createElement('template');
filterTemplate.innerHTML = '<div style="display:none;"><slot></slot></div>';
class VJOTGMain extends VJOTGFilter {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(filterTemplate.content.cloneNode(true));
	}

	allAttributesChangedCallback() {

		// HACK, Because it has no attributes allAttributesChangedCallback is called during construction
		// before shaderChunks is defined.
		this.shaderChunks = {};

		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		// If not in a valid parent then return
		if (!layerName) return;

		const customMain = this.textContent.trim() || false;
		this.shaderChunks.main = customMain.replace(/\[layer\]/gi, layerName);
	}
}

customElements.define('vj-otg-main', VJOTGMain);

class VJOTGGraph1 extends VJOTGFilter {
	constructor() {
		super();
	}

	allAttributesChangedCallback() {
		
		// HACK, Because it has no attributes allAttributesChangedCallback is called during construction
		// before shaderChunks is defined.
		this.shaderChunks = {};
		
		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		this.shaderChunks.main = `

		// Work in polar coordinates
		newUV.x = (PI + atan(newUV.x - 0.5, newUV.y - 0.5)) / (2.0 * PI);
		newUV.y = distanceFromCenter;

		// Get the current column and it's value
		int column = int(newUV.x * noAnalyserBins);
		float columnValue = (
			(float(column == 0) * analyser[0]) +
			(float(column == 1) * analyser[1]) +
			(float(column == 2) * analyser[2]) +
			(float(column == 3) * analyser[3]) +
			(float(column == 4) * analyser[4]) +
			(float(column == 5) * analyser[5]) +
			(float(column == 6) * analyser[6]) +
			(float(column == 7) * analyser[7]) +
			(float(column == 8) * analyser[8]) +
			(float(column == 9) * analyser[9]) +
			(float(column == 10) * analyser[10]) +
			(float(column == 11) * analyser[11]) +
			(float(column == 12) * analyser[12]) +
			(float(column == 13) * analyser[13]) +
			(float(column == 14) * analyser[14]) +
			(float(column == 15) * analyser[15]) +
			(float(column == 16) * analyser[16]) +
			(float(column == 17) * analyser[17]) +
			(float(column == 18) * analyser[18]) +
			(float(column == 19) * analyser[19])
		);

		// Each column is coloured using hsl
		vec3 rgbColumnColor = hsl2rgb(float(column)/noAnalyserBins, 1.0 , 0.5);

		// Work out whether that pixel should be coloured or not.
		${layerName} = mix(
			vec4(0.0, 0.0, 0.0, 0.0),
			vec4(rgbColumnColor, 1.0),
			float(newUV.y <= columnValue) * float(columnValue - newUV.y <= 0.1 )
		);`;
	}
}

customElements.define('vj-otg-graph1', VJOTGGraph1);

/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


class VJOTGRotate extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			angle: 'f'
		};
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

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.angle.uniform) {
			glAttributes.angle.uniform.value = glAttributes.angle.value;
		}
		this.shaderChunks.main = `newUV = rotate2D(newUV, centerCoord, (${
			glAttributes.angle.isSnippet ? glAttributes.angle.glslSnippet : glAttributes.angle.uniformName
		}) * deg2rad);`;
	}
}

customElements.define('vj-otg-rotate', VJOTGRotate);

/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


class VJOTGWave extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			speed: 'f',
			amplitude: 'f',
			frequency: 'f',
			t: 'f'
		};
	}

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.speed.uniform) {
			glAttributes.speed.uniform.value = glAttributes.speed.value;
		}
		if (glAttributes.frequency.uniform) {
			glAttributes.frequency.uniform.value = glAttributes.frequency.value;
		}
		if (glAttributes.t.uniform) {
			glAttributes.t.uniform.value = glAttributes.t.value;
		}
		if (glAttributes.amplitude.uniform) {
			glAttributes.amplitude.uniform.value = glAttributes.amplitude.value;
		}

		this.shaderChunks.main = `newUV = newUV + vec2(sin((vUv.y * (${
			glAttributes.frequency.isSnippet ? glAttributes.frequency.glslSnippet : glAttributes.frequency.uniformName
		}) + (${
			glAttributes.t.isSnippet ? glAttributes.t.glslSnippet : glAttributes.t.uniformName
		}) * (${
			glAttributes.speed.isSnippet ? glAttributes.speed.glslSnippet : glAttributes.speed.uniformName
		})) * PI) * (${
			glAttributes.amplitude.isSnippet ? glAttributes.amplitude.glslSnippet : glAttributes.amplitude.uniformName
		}), 0.0);`;
	}
}

customElements.define('vj-otg-wave', VJOTGWave);

/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


class VJOTGZoom extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			position: 'v2',
			factor: 'f'
		};
	}

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.position.uniform) {
			glAttributes.position.uniform.value.set.apply(
				glAttributes.position.uniform.value,
				glAttributes.position.value.split(',')
			);
		}
		if (glAttributes.factor.uniform) {
			glAttributes.factor.uniform.value = glAttributes.factor.value;
		}
		this.shaderChunks.main = `newUV = (newUV / (${
			glAttributes.factor.isSnippet ? glAttributes.factor.glslSnippet : glAttributes.factor.uniformName
		})) - (vec2(0.5, 0.5) / (${
			glAttributes.factor.isSnippet ? glAttributes.factor.glslSnippet : glAttributes.factor.uniformName
		})) + (${
			glAttributes.position.isSnippet ? glAttributes.position.glslSnippet : glAttributes.position.uniformName
		});`;
	}
}

customElements.define('vj-otg-zoom', VJOTGZoom);

/**
 * This distorts the current coordinate, newUV (vec2) so that
 * when it reads from a texture it gets a different position distorting the image
 */


class VJOTGMirror extends VJOTGFilter {
	constructor() {
		super();
	}
	
	static get types() {
		return {
			mode: 'i'
		};
	}

	allAttributesChangedCallback(glAttributes) {
		if (glAttributes.mode.uniform) {
			glAttributes.mode.uniform.value = glAttributes.mode.value;
		}
		this.shaderChunks.main = `
		
		int sym = ${
			glAttributes.mode.isSnippet ? glAttributes.mode.glslSnippet : glAttributes.mode.uniformName
		};
		
		if (sym == 1 || sym == 3) {
			if (newUV.x > 0.5) {
				newUV.x = 0.5 - (newUV.x - 0.5);
			}
		}
		if (sym == 2 || sym == 3) {
			if (newUV.y > 0.5) {
				newUV.y = 0.5 - (newUV.y - 0.5);
			}
		}`;
	}
}

customElements.define('vj-otg-mirror', VJOTGMirror);

/* bundle all the effects together whilst there is no native js import yet. */

 // vj-otg-mirror

}());
//# sourceMappingURL=filters.js.map
