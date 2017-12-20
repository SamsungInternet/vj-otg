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

export default VJOTGFilter;