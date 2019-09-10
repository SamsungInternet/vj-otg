'use strict';

// Polyfill!
// <script src="https://cdn.rawgit.com/webcomponents/webcomponentsjs/edf84e6e/webcomponents-sd-ce.js"></script>

/**
 * @customelement midi-controller
 * @description Wraps midi control elements to handle the WebMidi API
 * @example <caption>Access a Midi Control</caption>
 * <midi-controller>
 * 	<midi-cc channel="176" note="1" value="0">CC1</midi-cc>
 * </midi-controller>
 */
class MidiController extends HTMLElement {
	constructor() {
		super();

		this.accessMidi().then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
	}


	// midi functions
	onMIDISuccess(midiAccess) {
		// when we get a succesful response, run this code
		this.midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

		const inputs = this.midi.inputs.values();
		// loop over all available inputs and listen for any MIDI input
		for (const input of inputs) {
			// each time there is a midi message call the onMIDIMessage function
			input.onmidimessage = message => this.onMIDIMessage.bind(this)(message, input);
		}
	}

	onMIDIFailure(error) {
		// when we get a failed response, run this code
		console.log(
			'MIDI access has failed ☹️ Check the error & try restarting the browser. ' +
				error
		);
	}

	onMIDIMessage(message, input) {
		const detail = {
			device: (input.manufacturer ? input.manufacturer + ', ' || '') + (input.name ? input.name : 'unnamed device')
		};

		detail.data = message.data;
		detail.type = 'cc';

		// send type as well - if channel is between certain numbers then it's a pad, if not it's a CC - or something (it's a little bit rudementary but I don't have a better way ya)
		if (detail.data[0] > 120 && detail.data[0] < 150) {
			detail.type = 'pad';
		}

		const el =
			this.querySelector(
				`midi-cc[channel="${detail.data[0]}"][note="${detail.data[1]}"]`
			) ||
			this.querySelector(
				`midi-pad[channel-press="${detail.data[0]}"][note="${
					detail.data[1]
				}"]`
			) ||
			this.querySelector(
				`midi-pad[channel-release="${detail.data[0]}"][note="${
					detail.data[1]
				}"]`
			);

		// If it is a pad which has been has been released then set release value.
		if (el && detail.data[0] === el.channelRelease) {
			detail.data[2] = el.releaseValue;
		}

		if (el) {
			if (el.tagName === 'MIDI-PAD') {
				detail.type = 'pad';
			}
			if (el.tagName === 'MIDI-CC') {
				detail.type = 'cc';
				el.setAttribute('value', detail.data[2]);
			}
			el.dispatchEvent(new CustomEvent('midiMsg', { detail: detail, bubbles: true }));
		} else {
			this.dispatchEvent(new CustomEvent('midiMsg', { detail: detail, bubbles: true }));
		}
	}

	accessMidi() {

		// request MIDI access
		if (navigator.requestMIDIAccess) {
			return navigator
				.requestMIDIAccess({
					sysex: false
				});
		} else {
			console.log(
				'Sorry! There\'s no MIDI support in your browser ☹️ Why not try using Samsung Internet Browser 🤓'
			);
			return Promise.reject('No Midi Support ☹️');
		}
	}
}

window.addEventListener('DOMContentLoaded', function () {
	customElements.define('midi-controller', MidiController);
});
