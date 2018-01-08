import VJOTGFilter from '../prototype.js';

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
export default VJOTGMain;