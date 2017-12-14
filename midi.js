'use strict';

// midi stuff here
let midi;
// request MIDI access
if (navigator.requestMIDIAccess) {
	navigator
		.requestMIDIAccess({
			sysex: false
		})
		.then(onMIDISuccess, onMIDIFailure);
} else {
	// alert(
	// 	"Sorry! There's no MIDI support in your browser ☹️ Why not try using Samsung Internet Browser 🤓"
	// );
}

// midi functions
function onMIDISuccess(midiAccess) {
	// when we get a succesful response, run this code
	midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

	const inputs = midi.inputs.values();
	// loop over all available inputs and listen for any MIDI input
	for (
		const input = inputs.next();
		input && !input.done;
		input = inputs.next()
	) {
		// each time there is a midi message call the onMIDIMessage function
		input.value.onmidimessage = onMIDIMessage;
	}
}

function onMIDIFailure(error) {
	// when we get a failed response, run this code
	console.log(
		'MIDI access has failed ☹️ Check the error & try restarting the browser. ' +
			error
	);
}

function onMIDIMessage(message) {
	const detail = {};

	detail.data = message.data;
	detail.type = 'cc';

	// send type as well - if channel is between certain numbers then it's a pad, if not it's a CC - or something (it's a little bit rudementary but I don't have a better way ya)
	if (detail.data[0] > 120 && detail.data[0] < 150) {
		detail.type = 'pad';
	}

	const el =
		document.querySelector(
			`midi-cc[channel="${detail.data[0]}"][note="${detail.data[1]}"]`
		) ||
		document.querySelector(
			`midi-pad[channel-press="${detail.data[0]}"][note="${
				detail.data[1]
			}"]`
		) ||
		document.querySelector(
			`midi-pad[channel-release="${detail.data[0]}"][note="${
				detail.data[1]
			}"]`
		);
		
	// If it has been released then set release value.
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
		el.dispatchEvent(new CustomEvent('midiMsg', { detail: detail }));
	}
}