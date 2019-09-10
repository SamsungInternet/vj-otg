'use strict';
/* global HTMLElementPlus */

// Polyfill!
// <script src="https://cdn.rawgit.com/webcomponents/webcomponentsjs/edf84e6e/webcomponents-sd-ce.js"></script>

const padTemplate = document.createElement('template');

padTemplate.innerHTML = `
	<style>
	:host .midi-control__group {
		outline: 0;
		display: flex; box-sizing: border-box;
		flex-direction: column;
		align-content: stretch;
		width: 100%; height: 100%;
		padding: 1vw;
	}
	:host .midi-control__label {
		outline: 0;
		display: block; box-sizing: border-box;
		padding-bottom: 0.5em;
	}
	:host .midi-control__button--pad {
		outline: 0;
		display: block; box-sizing: border-box;
		flex: auto;
		margin: 0px auto;
		width: 100%;
		position: relative;
		cursor: pointer;
		background-color: hsla(210, 25%, 98%, 1.0);
		background-image:linear-gradient(0deg, hsla(210, 25%, 96%, 1.0), hsla(210, 25%, 98%, 1.0));
		border: 6px solid;
		border-image: linear-gradient(120deg, hsla(272, 54%, 80%, 1.0), hsla(194, 49%, 66%, 1.0), hsla(150, 52%, 64%, 1.0)) 10;
		border-radius: 1px;
		box-shadow:
			0px 0px 0px 1px hsla(210, 25%, 98%, 1.0),
			1px 1px 6px 2px hsla(0, 0%, 35%, 0.5),
			inset 2px 2px 0px 2px #fff,
			inset -2px -2px 0px 2px hsla(210, 25%, 98%, 1.0)
		;
	}
	:host .midi-control__button--pad[data-state="on"] {border-image: linear-gradient(120deg, hsla(272, 94%, 70%, 1.0), hsla(194, 89%, 56%, 1.0), hsla(150, 92%, 54%, 1.0)) 10;}
	</style>
	<div class="midi-control__group">
		<label class="midi-control__label" for="padEx" ref="label"><slot name="title"></slot></label>
		<button id="padEx" class="midi-control__button--pad" ref="input"><slot name="face"></slot></button>
	</div>
`;

if (window.ShadyCSS) {
	window.ShadyCSS.prepareTemplate(padTemplate, 'midi-pad');
}

/**
 * @customelement midi-pad
 * @description Used to read or emulate a midi pad.
 * @property channel-press   {number} Channel press events are emitted on
 * @property channel-release {number} Channel release events are emitted on, usually 16 lower
 * @property note            {number} The note to listen to.
 * @property value           {number} The value emited if the emulated pad is clicked
 * @example <caption>Access a Midi Pad</caption>
 * <midi-controller>
 * 	<midi-pad channel-press="144" channel-release="128" note="36" value="127" id="pad1">PAD1</midi-pad>
 * </midi-controller>
 */
class MidiPadController extends HTMLElementPlus {
	constructor() {
		super();

		this.tabIndex = 0;
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(padTemplate.content.cloneNode(true));
		this.message = {};
		this.message.type = 'pad';
		this.releaseValue = 0;

		/*A pad has two events, on down and on release*/
		// TODO: refactor this - also sort mousedown interfearing with scroll
		/* mouse down */
		this.refs.input.addEventListener('mousedown', () => {
			this.message.data = [this.channelPress, this.note, this.value];
			this.emitEvent('midiMsg', this.message );
		});

		/* touch down */
		this.refs.input.addEventListener('touchstart', () => {
			this.message.data = [this.channelPress, this.note, this.value];
			this.emitEvent('midiMsg', this.message );
		});

		/* mouse release */
		this.refs.input.addEventListener('mouseup', () => {
			this.message.data = [this.channelRelease, this.note, this.releaseValue];
			this.emitEvent('midiMsg', this.message );
		});
		/* touch release */
		this.refs.input.addEventListener('touchend', () => {
			this.message.data = [this.channelRelease, this.note, this.releaseValue];
			this.emitEvent('midiMsg', this.message );
		});

		this.addEventListener('midiMsg', function(e) {
			if (e.detail.data[0] === this.channelPress) {
				this.setAttribute('state', 'on');
			}
			if (e.detail.data[0] === this.channelRelease) {
				this.setAttribute('state', 'off');
			}
		});
	}

	static get observedAttributes() {
		return ['channel-press', 'channel-release', 'note', 'value', 'state', 'release-value'];
	}
	attributeChangedCallback(attr, oldValue, newValue) {
		if (attr === 'note') {
			this.note = parseInt(newValue);
		}

		if (attr === 'channel-press') {
			this.channelPress = parseInt(newValue);
		}

		if (attr === 'channel-release') {
			this.channelRelease = parseInt(newValue);
		}

		if (attr === 'release-value') {
			this.releaseValue = parseInt(newValue);
		}

		if (attr === 'value') {
			this.value = parseInt(newValue);
		}

		if (attr === 'state') {
			this.state = newValue;
			this.refs.input.dataset.state = newValue;
		}
	}
}

window.addEventListener('DOMContentLoaded', function() {
	customElements.define('midi-pad', MidiPadController);
});
