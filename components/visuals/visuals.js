'use strict';
/* global THREE, Detector, HTMLElementPlus */
const w = 480;
const h = 320;

const vjOTGVisuals = document.createElement('template');
vjOTGVisuals.innerHTML = `
	<style>
	vj-otg-assets {
		display: none;
	}
	</style>
	<slot></slot>
`;

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

		renderer.domElement.style.width = 'auto';
		renderer.domElement.style.height = 'auto';

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
			if (el.tagName === 'VJ-OTG-UNIFORM' && el.rafFn) el.rafFn();
		}

		material.needsUpdate = true;
		this.__render();
	}

	generateShader() {

		const chunks = Array.from(
			this.querySelectorAll(
				'VJ-OTG-FILTER, VJ-OTG-GROUP ,VJ-OTG-DISTORT, VJ-OTG-SOURCE, VJ-OTG-UNIFORM'
			)
		)
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
			shaderChunks.hsl +
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

		console.log(
			fragmentShader
				.split('\n')
				.map((l, i) => i + 101 + ': ' + l)
				.join('\n')
		);

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

customElements.define('vj-otg-visuals', VJOTGVisuals);

const shaderChunks = {};

shaderChunks.hsl = `
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
`;

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
