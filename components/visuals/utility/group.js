/* global HTMLElementPlus */

const groupTemplate = document.createElement('template');
groupTemplate.innerHTML = '<slot></slot>';

/**
 * @customelement vj-otg-group
 * @description <p>Provides VJ-OTG-Group used for changing what vj-otg-filter is applied to
 * Allowing us to effectively group effects.</p>
 * <p>newUV is reset to the current UV coordinates.</p>
 * <p>Also creates a new vec4 which layers can write to.</p>
 * <p>In the vj-otg-main component the string "[layer]" is replaced by this name.</p>
 * @property name {string} Name of this layer, is made a variable in the glsl code.
 * @example <caption>Draw a graph in a seperate layer then use it later.</caption>
 *	<vj-otg-group name="grapheffect">
 *		<vj-otg-graph1></vj-otg-graph1>
 *		<vj-otg-main>
 *			[layer] = mix([layer], vec4(1.0, 0.0, 0.0, 1.0), 0.5);
 *		</vj-otg-main>
 *	</vj-otg-group>
 *	<vj-otg-main>
 *		[layer] = mix(grapheffect, vec4(1.0, 0.0, 0.0, 1.0), 0.5);
 *	</vj-otg-main>
 *	<vj-otg-main>
 *		<pre><code lang="c">
 *		// float perlinNoise = clamp(snoise(vec3(newUV * 5.0, cc1)), 0.0, 1.0);
 *		float cc1a = cc1 * channel1.a;
 *		float cc2a = cc2 * channel2.a;
 *		float cc3a = cc3 * channel3.a;
 *		float cc4a = cc4 * channel4.a;
 *		float total = cc1a + cc2a + cc3a + cc4a + 0.05;
 *		[layer] =   mix(noopVec4, channel1, cc1a / total) *
 *					mix(noopVec4, channel2, cc2a / total) *
 *					mix(noopVec4, channel3, cc3a / total) *
 *					mix(noopVec4, channel4, cc4a / total) *
 *					mix(noopVec4, (0.0 * noopVec4), 0.05 / total);
 *		</code></pre>
 *	</vj-otg-main>
 */
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
export default VJOTGGroup;