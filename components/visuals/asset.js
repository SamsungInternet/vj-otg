'use strict';
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
