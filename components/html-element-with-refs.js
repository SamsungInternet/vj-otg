// For custom elements to extend and accs myEL.refs.someReference
class HTMLElementWithRefs extends HTMLElement {

	constructor () {
		super();
		this.refs = new Proxy({}, {
			get: this.__getFromShadowRoot.bind(this)
		});
	}
	
	__getFromShadowRoot (target, name) {
		return this.shadowRoot.querySelector('[ref="' + name + '"]');
	}
}