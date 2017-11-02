
// Polyfill!
// <script src="https://cdn.rawgit.com/webcomponents/webcomponentsjs/edf84e6e/webcomponents-sd-ce.js"></script>

const containerTemplate = document.createElement('template');

containerTemplate.innerHTML = `
	<style>
		.slide-controls {
			grid-column: slide;
			margin-bottom: var(--padding);
			justify-content: center;
			display: var(--button-display, flex);
		}
	</style>
	<div class="slide-controls grid-slides-controller">
		<slot></slot>
		<button class="start-button grid-slides-controller" ref="start">Start Presentation</button>
	</div>
`;



class GridSlidesController extends HTMLElementWithRefs {
	constructor() {
		super();
		
		this.tabIndex = 0;
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(containerTemplate.content.cloneNode(true));

		this.refs.start.addEventListener('click', this.startPresenting.bind(this));
	}
	
	static get observedAttributes() { return ['slide', 'transition', 'presenting', 'template']; }
	attributeChangedCallback(attr, oldValue, newValue) {
		if (attr === 'transition') {
			this.transition = GRIDSLIDES.transitions.get(newValue || 'slide');
		}
		if (attr === 'template') {
			this.template = newValue === 'default' ? slideTemplate : document.querySelector(newValue);
		}
		if (attr === 'presenting') {
			if (newValue === null) return;
			this.startPresenting();
		}
	}
}

window.addEventListener('DOMContentLoaded', function () {
	customElements.define('grid-slides-controller', GridSlidesController);
});
